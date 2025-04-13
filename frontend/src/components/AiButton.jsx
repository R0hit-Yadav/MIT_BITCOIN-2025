import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import './AiButton.css';

const AiButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/ai'); 
    };

    return (
        <div className="ai-button" onClick={handleClick} title="Chat with VaultX AI">
            <FaRobot />
        </div>
    );
};

export default AiButton;