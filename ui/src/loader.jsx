import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
`

// const Img = styled.img`
//     height: 20vmin;
//     pointer-events: none;
//     fill: white;

// `;

const Header = styled.header`
    background-color: ${props => props.environment == "QAS" ? "#27e2e3" : "#2D2D2D"};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;

    
`;
const Puff = styled.div`
    display: inline-block;
    position: relative;
    width: 210px;
    height: 210px;

    & div {
        position: absolute;
        border: 7px solid #fff;
        opacity: 1;
        border-radius: 50%;
        animation: lds-ripple 1.9s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    & div:nth-child(2) {
        animation-delay: -0.9s;
    }
    @keyframes lds-ripple {
        0% {
        top: 100px;
        left: 100px;
        width: 0;
        height: 0;
        opacity: 1;
        }
        100% {
        top: 0px;
        left: 0px;
        width: 200px;
        height: 200px;
        opacity: 0;
        }
    }
  
  `

const PuffLoader = () => (
    <Puff>
        <div></div>
        <div></div>
    </Puff>
)
function Loader(props) {
    return (
        <>
            <GlobalStyle />
            <Header environment={props.environment}>
                <PuffLoader />
                <p>
                    <code style={{ fontWeight: 'bold' }}>Installing FaustoApp</code>
                </p>
            </Header>
        </>
    );
}


export default Loader