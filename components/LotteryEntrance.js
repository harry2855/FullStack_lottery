import { useWeb3Contract } from "react-moralis"
import {abi,contractAddresses} from "../constants/index"
import { useMoralis } from "react-moralis"
import { useEffect ,useState} from "react"
import {ethers} from "ethers"
import { Button, Icon } from "web3uikit"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const  {chainId: chainIdHex, isWeb3Enabled} = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee,setEntranceFee] = useState("0")
    const [numPlayer,setNumPlayer] = useState("0")
    const [recentWinner,setRecentWinner] = useState("0")
    const dispatch = useNotification()
    const {runContractFunction: enterRaffle, isLoading,isFetching} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"enterRaffle",
        params:{},
        msgValue: entranceFee 
    })
    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"getEntranceFee",
        params:{},
    })
    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"getNumberOfPlayers",
        params:{},
    })
    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"getRecentWinner",
        params:{},
    })
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntranceFee((entranceFeeFromCall))
        setNumPlayer(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }
    useEffect(() => {
        if(isWeb3Enabled) {
            
            updateUI()
        }
    },[isWeb3Enabled])

    const handleSuccess = async function(tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }
    const handleNewNotification = function() {
        dispatch({
            type:"info",
            message:"Tx complpeted",
            title: "Enter Raffle",
            position: "topR",
            icon:"bell"
        })
    }

    return(
        <div>
            {raffleAddress ? (
            <div>
            <button onClick={async function (){
                await enterRaffle({
                    onSuccess: handleSuccess,
                })
                }}
                disabled = {isLoading || isFetching}
                >Enter Raffle</button>
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
            Number of Players: {numPlayer}
            Recnet Winner: {recentWinner}
            </div>)
            : (<div>Switch to a different network</div>)}
            
        </div>
    )
}