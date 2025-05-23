const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export async function uploadImageToIPFS(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY,
            },
            body: formData
        });

        const data = await response.json();
        return `https://ipfs.io/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw error;
    }
}

export async function storeNFTMetadata(name, description, image) {
    const metadata = {
        name,
        description,
        image
    };

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY,
            },
            body: JSON.stringify(metadata)
        });

        const data = await response.json();
        return `https://ipfs.io/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error('Error storing metadata to IPFS:', error);
        throw error;
    }
}