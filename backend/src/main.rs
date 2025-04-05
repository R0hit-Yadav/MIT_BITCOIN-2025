use warp::Filter;
use ethers::prelude::*;
use tokio;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use std::env;   
use dotenv::dotenv;
use reqwest;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct SendTxRequest {
    to: String,
    amount: String,
    from: String,
    signature: String,
    chain: String,
}

#[derive(Debug, Serialize)]
struct BalanceResponse {
    balance: String,
    chain: String,
}

#[derive(Debug, Serialize)]
struct Transaction {
    hash: String,
    from: String,
    to: String,
    value: String,
    timestamp: String,
    chain: String,
}

#[derive(Debug, Serialize)]
struct HistoryResponse {
    transactions: Vec<Transaction>,
}

#[derive(Debug, Clone)]
struct ChainConfig {
    name: String,
    rpc_url: String,
    explorer_url: String,
    chain_id: u64,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let infura_api_key = env::var("INFURA_API_KEY").expect("INFURA_API_KEY not set");

    // Configure different chains
    let chains: HashMap<String, ChainConfig> = HashMap::from([
        ("holesky".to_string(), ChainConfig {
            name: "Holesky".to_string(),
            rpc_url: format!("https://holesky.infura.io/v3/{}", infura_api_key),
            explorer_url: "https://holesky.etherscan.io".to_string(),
            chain_id: 17000,
        }),
        ("sepolia".to_string(), ChainConfig {
            name: "Sepolia".to_string(),
            rpc_url: format!("https://sepolia.infura.io/v3/{}", infura_api_key),
            explorer_url: "https://sepolia.etherscan.io".to_string(),
            chain_id: 11155111,
        }),
        // Add more chains as needed
    ]);

    // Create providers for each chain
    let mut providers: HashMap<String, Arc<Provider<Http>>> = HashMap::new();
    for (chain_id, config) in &chains {
        let provider = Provider::<Http>::try_from(&config.rpc_url)
            .expect(&format!("Could not connect to {} provider", chain_id));
        providers.insert(chain_id.clone(), Arc::new(provider));
    }

    // Enable CORS
    let cors = warp::cors().allow_any_origin().allow_methods(vec!["GET", "POST"]).allow_headers(vec!["Content-Type"]);

    // API Routes
    let balance_route = warp::path!("balance" / String / String)
        .and(with_providers(providers.clone()))
        .and_then(get_balance);

    let send_tx_route = warp::path!("send")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_providers(providers.clone()))
        .and(with_chains(chains.clone()))
        .and_then(send_transaction);

    let history_tx_routes = warp::path!("history" / String / String)
        .and(with_chains(chains.clone()))
        .and_then(get_transaction_history)
        .with(warp::cors().allow_any_origin());

    let routes = balance_route
        .or(send_tx_route)
        .or(history_tx_routes)
        .with(cors);

    println!("Server running on http://localhost:3030");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

fn with_providers(providers: HashMap<String, Arc<Provider<Http>>>) -> impl Filter<Extract = (HashMap<String, Arc<Provider<Http>>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || providers.clone())
}

fn with_chains(chains: HashMap<String, ChainConfig>) -> impl Filter<Extract = (HashMap<String, ChainConfig>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || chains.clone())
}

async fn get_balance(address: String, chain: String, providers: HashMap<String, Arc<Provider<Http>>>) -> Result<impl warp::Reply, warp::Rejection> {
    let provider = providers.get(&chain).ok_or_else(|| warp::reject::not_found())?;

    let address: Address = address.parse().expect("Invalid address");
    let balance = provider.get_balance(address, None).await.expect("Failed to fetch balance");
    
    Ok(warp::reply::json(&BalanceResponse {
        balance: format!("{}", ethers::utils::format_ether(balance)),
        chain,
    }))
}

async fn send_transaction(
    body: SendTxRequest,
    providers: HashMap<String, Arc<Provider<Http>>>,
    chains: HashMap<String, ChainConfig>,
) -> Result<impl warp::Reply, warp::Rejection> 
{
    println!("Received transaction request: {:?}", body);
    
    let provider = providers.get(&body.chain).ok_or_else(|| warp::reject::not_found())?;
    
    let chain_config = chains.get(&body.chain).ok_or_else(|| warp::reject::not_found())?;

    let to: Address = body.to.parse().expect("Invalid address");
    let from: Address = body.from.parse().expect("Invalid from address");
    let amount = ethers::utils::parse_ether(body.amount).expect("Invalid amount");

    // Get current gas price
    let gas_price = provider.get_gas_price().await.expect("Failed to fetch gas price");

    // Create transaction request
    let tx = TransactionRequest::new()
        .to(to)
        .value(amount)
        .gas_price(gas_price)
        .gas(21000)
        .from(from)
        .chain_id(chain_config.chain_id);

    // Send transaction
    match provider.send_transaction(tx, None).await {
        Ok(pending_tx) => {
            let receipt = pending_tx.await.expect("Transaction failed");
            let receipt = receipt.unwrap();
            
            let tx_details = serde_json::json!({
                "tx_hash": format!("{:?}", receipt.transaction_hash),
                "from": format!("{:?}", receipt.from),
                "to": format!("{:?}", receipt.to.unwrap_or_default()),
                "value": format!("{}", ethers::utils::format_ether(amount)),
                "gas_used": format!("{:?}", receipt.gas_used.unwrap_or_default()),
                "gas_price": format!("{:?}", receipt.effective_gas_price.unwrap_or_default()),
                "block_number": format!("{:?}", receipt.block_number.unwrap_or_default()),
                "status": if receipt.status.unwrap_or_default().as_u64() == 1 { "Success" } else { "Failed" },
                "chain": body.chain,
                "explorer_url": format!("{}/tx/{}", chain_config.explorer_url, receipt.transaction_hash)
            });
            
            println!("Transaction sent: {:?}", tx_details);
            Ok(warp::reply::json(&tx_details))
        },
        Err(e) => Ok(warp::reply::json(&serde_json::json!({ "error": format!("{}", e) }))),
    }
}

async fn get_transaction_history(
    address: String,
    chain: String,
    chains: HashMap<String, ChainConfig>,
) -> Result<impl warp::Reply, warp::Rejection> 
{
    let chain_config = chains.get(&chain)
        .ok_or_else(|| warp::reject::not_found())?;

    let etherscan_api_key = env::var("ETHERSCAN_API_KEY").expect("ETHERSCAN_API_KEY not set");
    let base_url = match chain.as_str() {
        "holesky" => "https://api-holesky.etherscan.io",
        "sepolia" => "https://api-sepolia.etherscan.io",
        _ => return Ok(warp::reply::json(&serde_json::json!({ "error": "Unsupported chain" }))),
    };

    let url = format!(
        "{}/api?module=account&action=txlist&address={}&startblock=0&endblock=99999999&sort=desc&apikey={}",
        base_url, address, etherscan_api_key
    );

    let response = reqwest::get(&url).await.expect("Failed to fetch data");
    let data: serde_json::Value = response.json().await.expect("Failed to parse JSON");

    if let Some(txs) = data["result"].as_array() {
        let transactions: Vec<Transaction> = txs.iter().map(|tx| Transaction 
        {
            hash: tx["hash"].as_str().unwrap_or("").to_string(),
            from: tx["from"].as_str().unwrap_or("").to_string(),
            to: tx["to"].as_str().unwrap_or("").to_string(),
            value: format!("{:.18}", tx["value"].as_str().unwrap_or("0").parse::<f64>().unwrap_or(0.0) / 1_000_000_000_000_000_000f64).trim_end_matches('0').trim_end_matches('.').to_string(),
            timestamp: tx["timeStamp"].as_str().unwrap_or("").to_string(),
            chain: chain.clone(),
        }).collect();

        Ok(warp::reply::json(&HistoryResponse { transactions }))
    } else {
        Ok(warp::reply::json(&serde_json::json!({ "error": "No transactions found" })))
    }
}







