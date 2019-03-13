pragma solidity ^0.4.21;
contract RevocationList{

    bytes1[46][] public AllDumpList;
    
    struct SigningRecord{       // record of certificate
        bytes32[3] SignString;  // signature string
        address addr;           // singing address
        bool confirm;           // confirm
    }
    
    struct RevocAddr {          // certificate
        address Applier;    //who apply to revocate this certHash
        SigningRecord[] record;    //2 or three sign needed
        bool isRevoc;       // whether is Revoc
        string Reason;
        uint cnt;
        uint TargetCnt;
        uint timestamp;      // record timestamp
        bytes32 certName;    // name of this certificate
        bytes32[4]  plainString;    // plain string
        uint certID;
    }
    
    struct OngoingRevoke{        
        bytes32[2] ipfshash;    // ipfshash file to revoke,split to two bytes32
        string queryhash;
        bytes32 CertName;
        uint certID;
    }

    mapping(address => string) ownTempCert;

    mapping(string => RevocAddr) revocaddr; // hash值對應到一個RevocAddr

    mapping(address => OngoingRevoke[]) TeacherConfirmList;  // 老師查找有哪幾個證書是要簽的

    mapping(address => bool) RevokeOngoing_Teacher;

    mapping(string => bool) RevokeOngoing_Cert;

    function updateTempCert(address own, string ipfsAddr) public {
        ownTempCert[own] = ipfsAddr;
    }

    function getTempCert(address own) view public returns(string) {
        return ownTempCert[own];
    }

    //check if a hash is revoc
    function checkList(string _queryhash) view public returns(bool){
       return revocaddr[_queryhash].isRevoc;
    }
    
    // set certificate time , certificate name ,Applier sign string
    function setCertTime(string _queryhash,bytes32 _certName,uint TimeStamp,string _reason) internal{
        revocaddr[_queryhash].certName = _certName;
        revocaddr[_queryhash].timestamp = TimeStamp;
        revocaddr[_queryhash].Reason = _reason;
    }
    
    // apply a hash to be revoked but not yet confirm
    function addList(string _queryhash,address _applier,address[] TeacherAddr,bytes32[4] stringToSign,bytes32 _certName,uint TimeStamp,string _reason,uint _certID) external{
        revocaddr[_queryhash].Applier = _applier;
        revocaddr[_queryhash].cnt = 0;
        revocaddr[_queryhash].plainString = stringToSign;
        revocaddr[_queryhash].certID = _certID;
        SigningRecord memory tmp;
        for(uint i = 0 ; i < TeacherAddr.length ; i++){
            tmp.addr = TeacherAddr[i];
            tmp.confirm = false;
            revocaddr[_queryhash].record.push(tmp);
        }
        revocaddr[_queryhash].TargetCnt = TeacherAddr.length;
        setCertTime(_queryhash,_certName,TimeStamp,_reason);
    }

    function addAllRevokeList(string _queryhash) public {
        bytes memory bQueryhash = bytes(_queryhash);
        bytes1[46] memory tempHash;
        for(uint j=0; j<bQueryhash.length; j++) {
            tempHash[j] = bQueryhash[j];
        }
        AllDumpList.push(tempHash);
    }
    
    //check if queryhash exist
    function checkInternal(string _queryhash) internal view returns(bool){
        if(revocaddr[_queryhash].Applier == 0)
            return false;
        return true;
    }

    // dump address array part of dump data
    function dumpArray(string _queryhash) external view returns(address[],bool[],bytes32[3][]) {
        uint len = revocaddr[_queryhash].record.length;
        address[] memory outputAddr = new address[](len);
        bool[] memory outputconfirm = new bool[](len);
        bytes32[3][] memory outputSign = new bytes32[3][](len);
         for(uint i = 0  ; i < len ; i++){
            outputAddr[i] = revocaddr[_queryhash].record[i].addr;
            outputconfirm[i] = revocaddr[_queryhash].record[i].confirm;
            outputSign[i] = revocaddr[_queryhash].record[i].SignString;
        }
        return (outputAddr,outputconfirm,outputSign);
    }

    // dump cert data
    function dumpData(string _queryhash) external view returns(bool ,address ,string ,bytes32, uint, uint){
        if(checkInternal(_queryhash) == true){
            address applier = revocaddr[_queryhash].Applier;
            bool isRevoc = revocaddr[_queryhash].isRevoc;
            string memory reason = revocaddr[_queryhash].Reason;
            bytes32 CertName = revocaddr[_queryhash].certName;
            //bytes32[4] memory outputString =  revocaddr[_queryhash].plainString;
            uint certID = revocaddr[_queryhash].certID;
            uint timestamp = revocaddr[_queryhash].timestamp;
            return (isRevoc, applier, reason, CertName, certID, timestamp);
        }
    }

    // check teacher Sig
    function getSignString(string _queryhash,address _TeacherAddr,bytes32[3] _SignString) external{
        if(checkInternal(_queryhash) == true){
            uint len = revocaddr[_queryhash].record.length;
            uint FIND = 1000;
            for(uint i = 0 ; i < len && FIND==1000 ; i++){
                if(revocaddr[_queryhash].record[i].addr == _TeacherAddr && revocaddr[_queryhash].record[i].confirm == false){
                    FIND = i;
                }
            }
            if(FIND != 1000){
                revocaddr[_queryhash].record[FIND].confirm = true;
                revocaddr[_queryhash].record[FIND].SignString = _SignString;
                revocaddr[_queryhash].cnt += 1;
                if(revocaddr[_queryhash].cnt == revocaddr[_queryhash].TargetCnt){
                    revocaddr[_queryhash].isRevoc = true;   //revoke cert if all sign from teacher collected
                }
            }
        }
    }
    
    function checkSig(string _queryhash,address _TeacherAddr) external view returns(string){
         if(checkInternal(_queryhash) == true){
            uint len = revocaddr[_queryhash].record.length;
            for(uint i = 0 ; i < len ; i++){
                if(revocaddr[_queryhash].record[i].addr == _TeacherAddr){
                    if(revocaddr[_queryhash].record[i].confirm == true){
                        return "address already confirmed";
                    }
                    else{
                        return "ok";
                    }
                }
            }
            return "address not found";
         }
         return "certificate hash not exist";
    }

    // add revocation to ongoing list
    function addTeacherRevokeList(address TeacherAddr,bytes32[2] _ipfshash,string _queryhash,bytes32 CertName,uint _certID) external{
        TeacherConfirmList[TeacherAddr].push(OngoingRevoke(_ipfshash,_queryhash,CertName,_certID));
        AddOngoing(TeacherAddr,_queryhash);
    }

    // Dump ongoing revoke list for a certain teacher , output ipfshash
    function DumpRevokeList(address TeacherAddr)  external view returns(uint[],bytes32[2][]){
        bytes32[2][] memory ipfsLists = new bytes32[2][](TeacherConfirmList[TeacherAddr].length);
        uint[] memory outputint = new uint[](TeacherConfirmList[TeacherAddr].length);
        for(uint i = 0 ; i < TeacherConfirmList[TeacherAddr].length ; i++){
            ipfsLists[i] = TeacherConfirmList[TeacherAddr][i].ipfshash;
            outputint[i] = TeacherConfirmList[TeacherAddr][i].certID;
        }
        return (outputint,ipfsLists);
    }
    // dump ongoing revoke for isrevoc and Certificate name
    function DumpRevokeName(address TeacherAddr) external view returns(bytes32[],bool[]){
         bytes32[] memory CertList = new bytes32[](TeacherConfirmList[TeacherAddr].length);
         bool[] memory outputbool = new bool[](TeacherConfirmList[TeacherAddr].length);
          for(uint i = 0 ; i < TeacherConfirmList[TeacherAddr].length ; i++){
             CertList[i] = TeacherConfirmList[TeacherAddr][i].CertName;
             if(checkList(TeacherConfirmList[TeacherAddr][i].queryhash) == true){
                outputbool[i] = true;
             }
             else{
                outputbool[i] = false;
             }
        }
        return (CertList,outputbool);
    }

    // set boolean to true
    function AddOngoing(address TeacherAddr,string _queryhash) internal{
        RevokeOngoing_Cert[_queryhash] = true;
        RevokeOngoing_Teacher[TeacherAddr] = true;
    }

    // is  revocation ongoing
    function ISOngoing(address TeacherAddr,string _queryhash) external view returns(bool,address){
        if(RevokeOngoing_Cert[_queryhash] == true && RevokeOngoing_Teacher[TeacherAddr]== true){
            return (true,TeacherAddr);
        }
        return (false,TeacherAddr);
    }

    // util
    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        
        assembly {
            result := mload(add(source, 32))
        }        
    }

    function dumpAllRevokeList() public view returns (bytes1[46][]) {
        return (AllDumpList);
    }
}