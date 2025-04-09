import React, { useState, useEffect } from 'react';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await response.json();
        setNews(data.Data);
        setFilteredNews(data.Data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleFilterChange = (category) => {
    setFilter(category);
    if (category === 'All') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.categories.toLowerCase().includes(category.toLowerCase())));
    }
  };

  const handleNewsClick = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-bar">
        <h1 className="news-title">News</h1>
        <div className="news-filters">
          {['All', 'Bitcoin', 'Ethereum', 'USA'].map(category => (
            <button
              key={category}
              className={`filter-button ${filter === category ? 'active' : ''}`}
              onClick={() => handleFilterChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="news-grid">
        {filteredNews.map((item) => (
          <div className="news-card" key={item.id} onClick={() => handleNewsClick(item.url)}>
            <img src={item.imageurl} alt={item.title} className="news-card-image" />
            <h2 className="news-card-title">{item.title}</h2>
            <p className="news-card-date">{new Date(item.published_on * 1000).toLocaleDateString()}</p>
            <p className="news-card-body">{item.body.substring(0, 150)}...</p>
            <p className="news-card-source">Source: {item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;