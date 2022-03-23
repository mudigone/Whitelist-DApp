import Head from 'next/head';
import Image from 'next/image';
import {useEffect,useRef, useState} from "react";
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import { Contract, providers } from "ethers";
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants';


export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false); 
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const web3ModalRef = useRef();
  const [loading,setloading] = useState(false);


  const getProviderOrSigner = async(needSigner = false) =>{
    try{
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();
      if(chainId !== 4){
        window.alert("Change Network to Rinkeby");
        throw new Error("Change Network to Rinkeby");
      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    }catch(err){
        console.error(err)
    }
  };

  const addAddressToWhitelist = async() => {
    try{ const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
       );
        const tx = await whitelistContract.addAddressToWhitelist();
        await tx.wait();
        setloading(false);
        await getNumberOfWhitelisted();
        setJoinedWhitelist(true);
    }catch(err){
      console.error(err);
    }
  }
  const checkIfAddressIsWhitelisted = async () => {
    try {
          const signer = await getProviderOrSigner(true);
          const whitelistContract = new Contract(
            WHITELIST_CONTRACT_ADDRESS,
            abi,
            signer
           );
           const address = await signer.getAddress();
           const joinedWhitelist = await whitelistContract.whitelistedAddresses(
             address
           );
           setJoinedWhitelist(joinedWhitelist);
    }catch(err)
    {
      console.error(err);
    }
  }

  const getNumberOfWhitelisted = async() => {
    try{
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          provider
         );

         const _numOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
         setNumOfWhitelisted(_numOfWhitelisted);
    }catch(err){
      console.log(err)
    }
  }

  const renderButton = () =>{
    if(walletConnected){
      if(joinedWhitelist){
        return (<div className={styles.description}>
          You have already joined, Thankyou!
         </div>)
      }else if(loading){
        return (
          <button className={styles.button}>
            ..loading
          </button>
        )
      }else {
        return (
              <button onClick={addAddressToWhitelist} className={styles.button}>
                Join the Whitelist
              </button>
        )
      }
    }else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      )
    }
  }

  const connectWallet = async() => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true)
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    }catch(err){
        console.error(err)
    }
  }
  useEffect(()=>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network:"rinkeby",
          providerOptions: {},
          disabledInjectedProvider: false,
        });
        connectWallet();
      }
  }, [walletConnected]);


  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by @mudigone
      </footer>
    </div>
  );
}
