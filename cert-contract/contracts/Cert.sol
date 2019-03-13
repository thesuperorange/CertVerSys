pragma solidity ^0.4.23;


contract Cert {

    address owner;
    //cause out of gas error
   // string _version = "1.0.1";

//issueID ->certID
    mapping(uint=> IssueInfo) ISSUE_INFO;
    mapping( uint => CertInfo ) CERT_INFO;
    mapping( address => uint[] ) OWNER_CERT_LIST;

    mapping(address =>uint[]) ISSUE_ID_LIST; //get issue list by issuer address
    mapping(address =>uint[]) ISSUE_ID_LIST_by_Singer;
    mapping(address =>SignInfo) SIGNER_CERT_LIST;
   
    struct IssueInfo{
        uint[] certID;
        uint[] signedCertID;

    }
    
    struct SignInfo {
        uint[] certID;
        mapping (uint => bool) status;
    }
    
    struct CertInfo {
        address OwnerAddr;
        bytes32 userID;
        CertCommon detail;        
        bool done;
       // bytes32 swarmhash;  //is P2pLoc
       
        bytes32 CertHash;
        bytes32 JsonHash1;
        bytes32 JsonHash2;
        bytes32 P2pLoc;
        bytes1[46] ipfshash;    // add ipfshash in cert
    }
    
    struct CertCommon {
        address IssuerAddr;
       // address OrgContract;  //this contract's addr
        address[] SignerAddr;
        bytes32[] signerID;
        mapping (address => SignerInfo) signer;
        string Version;
        string CertName;
        bool Revocation;
        string Description;
        string Timestamp;
    }
    
    struct SignerInfo {
      //  uint signerID;
        bool status;
        string publickey;
        string signature;
    }

    constructor ()public  {
        owner = msg.sender;
    }

    function getContractAddr()public view returns(address){
        return this;
    }
   

    mapping( address => UserCertinfo ) usercertinfo;
    struct UserCertinfo {
        uint[] certid;
    }


    
    function issueCommon(
        uint issue_id,uint[] certID, address issuer_addr, address[] signer_addr, bytes32[] signer_id, 
        string cert_name, string description, string timestamp)public {
        ISSUE_ID_LIST[issuer_addr].push(issue_id);
        CertCommon storage certCommon;
        //= createCertCommon(version,  cert_name,  description,  timestamp,  revocation,  issuer_addr, signer_addr);
        certCommon.Version = "1.0.1";
        certCommon.CertName = cert_name;
        certCommon.Revocation = false;
        certCommon.Description = description;
        certCommon.Timestamp = timestamp;
        certCommon.IssuerAddr = issuer_addr;        
        certCommon.SignerAddr = signer_addr;

        for (uint8 i = 0; i < signer_addr.length; i++) {
            certCommon.SignerAddr.push(signer_addr[i]);
            certCommon.signer[signer_addr[i]].status = false;
            certCommon.signerID.push(signer_id[i]);
            ISSUE_ID_LIST_by_Singer[signer_addr[i]].push(issue_id);
        }

        for (uint8 j = 0; j < certID.length; j++) {
            CERT_INFO[certID[j]].detail = certCommon;
        }
       
    }
    function issueDetail(uint issue_id, uint[] certID, bytes32[] user_id, address[] owner_addr, bytes32[] cert_hash, bytes32[] json_hash, address[] signer_addr, bytes1[46][] ipfs_addr)public{
        if(!(certID.length == owner_addr.length) && (certID.length == cert_hash.length)) revert();
   
            
        for (uint8 i = 0; i < certID.length; i++) {
            ISSUE_INFO[issue_id].certID.push(certID[i]);
            CERT_INFO[certID[i]].userID = user_id[i];
            OWNER_CERT_LIST[owner_addr[i]].push(certID[i]); 
            CERT_INFO[certID[i]].OwnerAddr = owner_addr[i];
            CERT_INFO[certID[i]].CertHash = cert_hash[i];
            CERT_INFO[certID[i]].JsonHash1 = json_hash[i];
            CERT_INFO[certID[i]].ipfshash = ipfs_addr[i];
            
            CERT_INFO[certID[i]].done = false;
            for(uint j = 0; j<signer_addr.length; j++){
                SIGNER_CERT_LIST[signer_addr[j]].certID.push(certID[i]);
                SIGNER_CERT_LIST[signer_addr[j]].status[certID[i]] = false;
            }
        }
    }

 
    function pushCertIDToOwner(address[] user_addr, uint[] cert_id)public {
        if(cert_id.length != user_addr.length) revert();
       
        for(uint8 i = 0; i < user_addr.length; i++){
            address current_addr = user_addr[i];            
            OWNER_CERT_LIST[current_addr].push(cert_id[i]);            
        }
    }
    
  
    //rename pushSignerPublickey to sign
    function sign(uint certID, string publickey, address signer, /*uint issue_id, */string sjws/*, bytes32 userid*/ )public {
        if(CERT_INFO[certID].OwnerAddr == 0)   revert();
        CERT_INFO[certID].detail.signer[signer].publickey = publickey;        
        //CERT_INFO[certID].detail.signer[signer1].signerID = userid;       

        //for getall info         
        //CERT_INFO[certID].detail.signerID.push(userid);
        
        CERT_INFO[certID].detail.signer[signer].signature = sjws;
        CERT_INFO[certID].detail.signer[signer].status = true;
        //signerCertInfo[signer1].signerListInfo[issueid].signedList.push(certID);

        SIGNER_CERT_LIST[signer].status[certID] = true;
        bool status = true;
        for (uint8 i = 0; i < CERT_INFO[certID].detail.SignerAddr.length; i++) {
            address signer_addr = CERT_INFO[certID].detail.SignerAddr[i];
            if( !CERT_INFO[certID].detail.signer[signer_addr].status){
                status = false;
                break;
            }
        }
        if(status==true) CERT_INFO[certID].done = true;
    }
    function revoke(uint certID) public {
        CERT_INFO[certID].detail.Revocation = true;
    }

    function getSignerCertList(address signer)public view returns(uint[]){
        //sould use memory to avoid out of gas
        uint[] memory certList = new uint[](SIGNER_CERT_LIST[signer].certID.length);        
        uint idx = 0;
        for(uint i = 0; i<SIGNER_CERT_LIST[signer].certID.length ; i++){

            uint certID = SIGNER_CERT_LIST[signer].certID[i];
            if(!SIGNER_CERT_LIST[signer].status[certID]){
                certList[idx] = certID;
                idx++;
            }
        }

        //solidity cannot use dynamic array for memory
        uint[] memory certList_short = new uint[](idx);    
        for(i = 0; i<idx ; i++){
            certList_short[i] = certList[i];
        }

        return certList_short;
    }
    function getSignerCertList_idx(address signer)public view returns(uint){
        //sould use memory to avoid out of gas
        uint[] memory certList = new uint[](SIGNER_CERT_LIST[signer].certID.length);        
        uint idx = 0;
        for(uint i = 0; i<SIGNER_CERT_LIST[signer].certID.length ; i++){

            uint certID = SIGNER_CERT_LIST[signer].certID[i];
            if(!SIGNER_CERT_LIST[signer].status[certID]){
                certList[idx] = certID;
                idx++;
            }
        }

        //solidity cannot use dynamic array for memory
        uint[] memory certList_short = new uint[](idx);    
        for(i = 0; i<idx ; i++){
            certList_short[i] = certList[i];
        }

        return idx;
    }
    //have not set yet
    //rename get_swarm_hash
    /*function getSwarmHash (uint certID)public view returns(bytes32){
        return (CERT_INFO[certID].swarmhash);
    }*/
    
    //getsignerpub
    function getSignerPubkey (uint certID,address signer)public view returns(string){
        return (CERT_INFO[certID].detail.signer[signer].publickey);
    }

    //getsignerstatus    
    //never used, incorrect code, why return only 1 status???
    /*function getSignerStatus (uint certID, address[] signeraddress)public view returns(bool){
        bool sigstatus;
        sigstatus = false;
        for(uint8 i = 0;i < CERT_INFO[certID].detail.SignerAddr.length;i++){
            sigstatus = CERT_INFO[certID].detail.signer[CERT_INFO[certID].detail.SignerAddr[i]].status;
        }
        return (sigstatus);
    }*/
    // getallinfo
    function getCertInfo (uint certID) public view  returns( string, string, string, string, address, bytes1[46] ){       
        return ( CERT_INFO[certID].detail.Description, CERT_INFO[certID].detail.Timestamp, CERT_INFO[certID].detail.Version, 
        CERT_INFO[certID].detail.CertName, CERT_INFO[certID].detail.IssuerAddr, CERT_INFO[certID].ipfshash);
        
    }
    //?????signer id didn't set before sign
    //getallinfo2
    //seperate to 2 function because too much variables
    function getCertInfo2 (uint certID)public view returns(address,bytes32,bytes32,bytes32[],address[],bytes32,bool){
        return (CERT_INFO[certID].OwnerAddr,CERT_INFO[certID].CertHash,CERT_INFO[certID].JsonHash1,CERT_INFO[certID].detail.signerID,
        CERT_INFO[certID].detail.SignerAddr,CERT_INFO[certID].userID,CERT_INFO[certID].detail.Revocation);
    }
    //get_CertHash
    function getCertHash (uint certID)public view returns(bytes32){
        return (CERT_INFO[certID].CertHash);
    }

    function getOwnerAddr (uint certID)public view returns(address){
        return CERT_INFO[certID].OwnerAddr;
    }
    function getIssuerAddr(uint certID)public view returns(address){
        return CERT_INFO[certID].detail.IssuerAddr;
    }
    
    function getSignerAddr(uint certID)public view returns(address[]){
        return CERT_INFO[certID].detail.SignerAddr;
    }

    function setJsonHash2(uint certID,bytes32 json_hash)public  {
        CERT_INFO[certID].JsonHash2 = json_hash;
    }
    function getJsonHash1(uint certID)public view  returns (bytes32){
        return CERT_INFO[certID].JsonHash1;
    }
    function getJsonHash2(uint certID)public view  returns (bytes32){
        return CERT_INFO[certID].JsonHash2;
    }

    function getStatus(uint certID, address signer)public view returns (bool){
        return CERT_INFO[certID].detail.signer[signer].status;
    }

    function checkStatus(uint certID) public view returns (bool){
        return CERT_INFO[certID].done;
    }
    //getsig
    function getSignature(uint certID,address signerad) public view returns(string){
        return CERT_INFO[certID].detail.signer[signerad].signature;
    }
    function setP2PLoc(uint certID, bytes32 location) public  {
        CERT_INFO[certID].P2pLoc = location;
    }

    function getP2PLoc(uint certID) public view returns (bytes32) {
        return CERT_INFO[certID].P2pLoc;
    }
//--------------------signer cert info

    function getIssuerIssueIDList (address issue_addr )public view returns(uint[]){
        return (ISSUE_ID_LIST[issue_addr]);
    }

    function getSignerIssueIDList (address signer_addr )public view returns(uint[]){
        return (ISSUE_ID_LIST_by_Singer[signer_addr]);
    }

    function getSignedList ( uint issue_id) public view returns(uint[]){
        if(ISSUE_INFO[issue_id].certID.length==0)revert();
               
        uint[] memory all_certID = ISSUE_INFO[issue_id].certID; 
        for(uint8 i = 0;i < all_certID.length;i++){
            uint curr_certID = all_certID[i];
            if(CERT_INFO[curr_certID].done==true){
                ISSUE_INFO[issue_id].signedCertID.push(curr_certID);
            }
        } 
        
        return ISSUE_INFO[issue_id].signedCertID;
    }

         

    function getCertIDList(uint issue_id)public view returns(uint[]){
        return ISSUE_INFO[issue_id].certID;  
    }

 
    function getIssueIDInfo ( uint issue_id )public view returns(uint[],string,string,string,uint[]){
        //uint[] all_certID = ISSUE_INFO[issue_id];
        uint[] memory signedList = getSignedList(issue_id);
        CertCommon memory detail = CERT_INFO[ISSUE_INFO[issue_id].certID[0]].detail;
        return(ISSUE_INFO[issue_id].certID,detail.CertName,detail.Description,detail.Timestamp, signedList);
    }   

//--------------owner's cert info
//getusercert
    function getUserCert (address user_addr)public view returns(uint[]){
        return (OWNER_CERT_LIST[user_addr]);
    }
    //--------------add ipfshash to CERT_INFO
    // function addIpfsHash(uint certID,string ipfshash) public returns(string){
    //     CERT_INFO[certID].ipfshash = ipfshash;
    //     return "success";
    // }
    //--------------get ipfshash to CERT_INFO
    function getIpfsHash(uint certID) public view returns(bytes1[46]){
        return (CERT_INFO[certID].ipfshash);
    }
}
