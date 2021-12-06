import React from 'react';
import twitterLogo from '../assets/twitter-logo.svg';
import githubLogo from '../assets/github-logo.svg';

const TWITTER_HANDLE = '0xIffy';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const GITHUB_HANDLE = '0xIffy';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}/sol_chess`;


class Navbar extends React.Component {

  render() { 
    return (
      <nav>
        <div className="bg-gray h-12 flex justify-between items-center">
          <div className="flex justify-start ml-3">
            <p className="text-accent text-3xl font-bold hover:text-accent2">Chaoss</p>
          </div>
          <div className="flex justify-around mr-3"> 
            <div className="flex justify-end">
              <a href={TWITTER_LINK} target="_blank">
                <img alt="Twitter Logo" className="w-12 mr-1" src={twitterLogo} />
              </a>
            </div>
            <div className="flex justify-end mt-1">
              <a href={GITHUB_LINK} target="_blank">
                <img alt="Github Logo" className="w-9" src={githubLogo} />
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
 
export default Navbar;