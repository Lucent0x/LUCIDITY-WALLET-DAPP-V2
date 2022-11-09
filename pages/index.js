import Head from './head'
import { useState, useEffect } from 'react'
import styles from '../styles/wallet.module.css'
import 'bulma/css/bulma.css'
import Web3 from 'web3'
import SmartContract from '../Blockchain/wallet'

const Wallet = () => {

  // STATE VARIABLES
  const [error, setError] = useState('')
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [walletContract, setWalletContract] = useState(null)
  const [contractAddress, setContractAddress] = useState(null)
  const [owner, setOwner] = useState('')
  const [balance, setBalance] = useState('')
  const [amount, setAmount] = useState(0)
  const [individual, setIndividual] = useState('')
  const [transactions, setTransacations] = useState('')
  const [lastTransaction, setLastTransction] = useState('')
  const [txID, setTxID] = useState('')
  const [singleTransactionData, setSingleTransactionData] = useState('')


  useEffect(() => {
    if (walletContract) getCA()
    if (walletContract) getWalletOwner()
    if (walletContract) getBalance()
    if (walletContract) getHistoryCount()
    if (walletContract) getLastTransction()
    if (walletContract) getSingleTransaction()
    connectWalletHandler()
  }, [walletContract])


  const getCA = async () => {
    let CA = await walletContract.methods.displayCA().call()
    setContractAddress(CA)
  }


  const getWalletOwner = async () => {
    let walletOwner = await walletContract.methods.walletOwner().call()
    setOwner(walletOwner)
  }

  const getBalance = async () => {
    let wBalance = await walletContract.methods.balance().call()
    setBalance(web3.utils.fromWei(`${wBalance}`))
  }

  const updateAmount = async (event) => {
    let _value = event.target.value
    setAmount(web3.utils.toWei(`${_value}`, 'ether'))
    console.log(amount)
  }

  const makeADeposit = async () => {
    try {
      console.log(amount)
      await walletContract.methods.deposit().send({
        from: address,
        value: `${amount}`,
      })
      console.log(amount)
    } catch (error) {
      setError(error.message)
    }
  }

  const setReciever = async (event) => {
    let Individual = event.target.value
    setIndividual(Individual)
  }

  const makeATransfer = async () => {
    try {
      await walletContract.methods.transfer(`${individual}`, `${amount}`).send({
        from: `${address}`
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const getHistoryCount = async () => {
    let count = await walletContract.methods.historyCount().call()
    setTransacations(count)
  }

  const getLastTransction = async () => {
    await walletContract.methods.getHistory().call().then((record) => {
      for (let i = 0; i < record.length; i++) {
        setLastTransction({
          txId: record[i][0],
          txType: record[i][1],
          txValue: web3.utils.fromWei(record[i][2])
        })
      }

    }
    )
  }


  const getSingleTransaction = async () => {
    await walletContract.methods.history(txID || 0).call().then((data) => {
      setSingleTransactionData({
        id: data[0],
        type: data[1],
        amount: web3.utils.fromWei(data[2]),
        sender: data[3],
        reciever: data[4]

      })
    })
  }

  const updateTxId = async (event) => {
    let id = event.target.value;
    setTxID(id)
    getSingleTransaction()
  }


  const connectWalletHandler = async () => {
    setError('')
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        //requesting for wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        web3 = new Web3(window.ethereum)
        setWeb3(web3)

        // choosing an account
        const accounts = await web3.eth.getAccounts()
        setAddress(accounts[0])

        // bringing in the wallet 
        const wc = SmartContract(web3)
        setWalletContract(wc)

        // event 
        window.ethereum.on('accountsChanged', async () => {
          // Time to reload your interface with accounts[0]!
          let accounts = await web3.eth.getAccounts()
          setAddress(accounts[0])

        });

      } catch (error) {
        setError(error.message)
      }
    } else {
      setError('pls install metamask');
    }
  }


  return (
    <div className={styles.main}>
      <Head>
        <title> Blockchain Wallet</title>
        <meta name="description" content="A wallet built on a blockchain" />
      </Head>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet" />

      <nav className='navbar mt-4 mb-4'>
        <div className='container'>
          <div className='navbar-brand'>
            <h1 > LUCIDITY  WALLET
              <p className='has-text-primary is light '>CA: {contractAddress}</p>
            </h1>
          </div>
          <div className='navbar-end'>
            <button className='button is-primary' onClick={connectWalletHandler}> CONNECT WALLET </button>
          </div>
        </div>
      </nav>
      <section>
        <section className='container'>
          <div className="card">
            <div className="card-content  has-text-centered">
              <p className="title">{owner} </p>
              <p className="subtitle"> {balance} GoerliETH</p>
            </div>
            <footer className="card-footer">
              <div className="card-footer-item">
                <div className={`control ${styles.flex}`}>
                  <input onChange={updateAmount} className="input is-medium is-focused" type="text" placeholder="Amount " />
                  <button onClick={makeADeposit} className='button is-info end ml-6 is-medium' > DEPOSIT </button>
                </div>
              </div>

              <div className="card-footer-item">
                <div className={`control ${styles.flex}`}>
                  <input onChange={setReciever} className="input is-medium is-focused" type="text" placeholder="Reciever Address" />
                  <button onClick={makeATransfer} className='button is-success ml-6 is-medium'> TRANSFER </button>
                </div>
              </div>
            </footer>
            <div className="card-content mt-4">
              <div className='card-footer'>

                <div className={`card-footer-item ${styles.flow}`}> <div className='subtitle has-text-centered box has-text-success'>
                  <b> Recorded  {transactions} Successful Transactions </b>

                  <ul className={`subtitle  `}>
                    <p><b className='mt-3'>Your Last Transaction &darr; </b>  </p>
                    <li className='box'> INDEX: <b>{lastTransaction.txId}</b> Tag: <b>{lastTransaction.txType} </b>
                      <b> {lastTransaction.txValue} GoerliETH</b>
                    </li>
                  </ul>
                </div>

                </div>
                <div className='card-footer-item'>
                  <div className='box'>
                    <div className={`control ${styles.flex}`}>
                      <input onChange={updateTxId} className="input is-medium is-focused" type="text" placeholder="Transaction ID " />
                      <button className='button is-info end ml-6 is-medium'> FETCH </button>
                    </div>
                    <div className='subtitle mt-6'>
                      <ul className='box has-text-primary mt-4'>
                        <li><b> Transaction id: </b>  <i>  {singleTransactionData.id}</i></li>
                        <li><b> Type: </b>  <i>  {singleTransactionData.type} </i></li>
                        <li><b> Amount: </b>  <i> {singleTransactionData.amount} GoerliETH </i> </li>
                        <li> <a className='has-text-link' href={`https://goerli.etherscan.io/address/${singleTransactionData.reciever}`} target="_blank" rel="noreferrer"><b> Reciever: </b>  <i> {singleTransactionData.reciever}</i></a></li>
                        <li><a className='has-text-link' href={`https://goerli.etherscan.io/address/${singleTransactionData.sender}`} target="_blank" rel="noreferrer"><b> Sender: </b>  <i> {singleTransactionData.sender} </i> </a></li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
        <div className='has-text-danger'>
          <p>  {error} </p>
        </div>
      </section>
    </div>
  )
}

export default Wallet;