pragma solidity ^0.4.23;


contract CertDB{
    
    address owner;  
 
    
    struct UsersInfo{
        string studentID;
        string name;
        bytes32 orgID;
        string classID;
        uint8 role;
        address userAddr;
    }
    struct OrgsInfo{
        bytes32 orgID;
        string orgIDOri;
        string orgName;
        address contractAddr;
    }

    struct PublickeyStruct{
        string publickeyid;
        string publickeytype;
        string publickeyowner;
        string publickeyhex;
        
    }

    struct Didrecord{
        string context;
        string didid;
        mapping(uint =>  PublickeyStruct) pubdetail;
        
        string[] authentication;
        string[] service;
        string[] proof;
    }
    
    mapping( bytes32 => Didrecord)  didrecord;
    mapping( bytes32 => UsersInfo ) public usersInfo;
    mapping( bytes32 => OrgsInfo ) public orgsInfo;


    mapping(bytes32 =>bytes32[]) query_studentlist;
    mapping(bytes32=>bytes32[]) query_school_teacher;
    mapping(bytes32 =>string[]) query_classlist;
    mapping(bytes32=>  mapping(bytes32 => bool)) classMapList;

    constructor () public{
        owner = msg.sender;         
    }
    
    function getOwner() public view returns(address){
        return owner;
    }    
    //--------------did------------------
    function setDidInfo(bytes32 uid,string ctx,string didid,string pubid, string _type, string oner, string _hex,uint knum,address uaddr)public{
        //set didrecord
        didrecord[uid].context = ctx;
        didrecord[uid].didid = didid;
        
        //set publickeyid
       // string owner = didrecord[user_id].didid;
        didrecord[uid].pubdetail[knum].publickeyid = pubid;
        didrecord[uid].pubdetail[knum].publickeytype = _type;
        didrecord[uid].pubdetail[knum].publickeyowner = oner;
        didrecord[uid].pubdetail[knum].publickeyhex = _hex;
        
        //setUserAddr
        usersInfo[uid].userAddr = uaddr;
    }

    //never used in api2
    /*
    function setdidrecord(bytes32 user_id, string _context, string _id){
        didrecord[user_id].context = _context;
        didrecord[user_id].didid = _id;
    }
    
    function setpublickey(bytes32 user_id, string _id, string _type, string _owner, string _hex,uint key_num){
        string owner = didrecord[user_id].didid;
        didrecord[user_id].pubdetail[key_num][owner].publickeyid = _id;
        didrecord[user_id].pubdetail[key_num][owner].publickeytype = _type;
        didrecord[user_id].pubdetail[key_num][owner].publickeyowner = _owner;
        didrecord[user_id].pubdetail[key_num][owner].publickeyhex = _hex;
    }
*/
    //getdidrecord
    function getDidRecord(bytes32 user_id)view public returns(string, string) {
        return(didrecord[user_id].context, didrecord[user_id].didid);
    }
    /*
    function getdidpublickey(bytes32 user_id,uint key_num)constant returns(string, string, string, string) {
        string did = didrecord[user_id].didid;
        return(didrecord[user_id].pubdetail[key_num][did].publickeyid, didrecord[user_id].pubdetail[key_num][did].publickeytype, didrecord[user_id].pubdetail[key_num][did].publickeyowner, didrecord[user_id].pubdetail[key_num][did].publickeyhex);
    }
   */
   //getpublickeyhex
    function getPublickeyHex(bytes32 user_id,uint key_num)view public returns(string ){
        
        return (didrecord[user_id].pubdetail[key_num].publickeyhex);
    }

    //----------userinfo--------------
    //never used in api2
   /*function setUserAddr(bytes32 user_id ,address useraddr) {
        usersInfo[user_id].userAddr = useraddr;
    }*/




//setuserinfo, distinctclass, StudentList
    function insertUser(bytes32 uid, bytes32 org_id, string class_id, uint8 urole, string stuID, string name)  public{
        //set userinfo
        usersInfo[uid].orgID = org_id;
        usersInfo[uid].classID = class_id;
        usersInfo[uid].role = urole;
        usersInfo[uid].name = name;
        usersInfo[uid].studentID = stuID;
        bytes32 class_byte32 = stringToBytes32(class_id);
        bytes32 org_class = org_id^class_byte32;
        //set distinctclass
        if(/*query_classlist[org_id].length>0 &&*/ !isEmptyString(class_id)){
            if(!classMapList[org_id][class_byte32]){
                // Append
                classMapList[org_id][class_byte32] = true;
                query_classlist[org_id].push(class_id);
            }
        }
        //set studentlist
        if(urole==3){
            query_studentlist[org_class].push(uid);
        }
        else if(urole==1){
            query_school_teacher[org_id].push(uid);
        }
        
    }
/*
    function setUserInfo(bytes32 user_id,bytes32 org_id,string class_id, uint8 user_role, string studentID, string name) public{
        usersInfo[user_id].orgID = org_id;
        usersInfo[user_id].classID = class_id;
        usersInfo[user_id].role = user_role;
        usersInfo[user_id].name = name;
        usersInfo[user_id].studentID = studentID;

    }
*/
    function getUserInfo(bytes32 user_id)view public returns(bytes32,string,uint8,address,string,string){
        
        bytes32 orgID = usersInfo[user_id].orgID;
        string memory classID = usersInfo[user_id].classID;
        uint8  role = usersInfo[user_id].role;
        address  useraddr = usersInfo[user_id].userAddr;
        string memory name = usersInfo[user_id].name;
        string memory studentID = usersInfo[user_id].studentID;
        return (orgID,classID,role,useraddr,name,studentID);
    }

    function getUserOrg(bytes32 user_id)view public returns (bytes32){
        return usersInfo[user_id].orgID;
    }
    function getUserClass(bytes32 user_id)view public  returns (string){
        return usersInfo[user_id].classID;
    }
    function getUserAddress(bytes32 user_id)  view public returns (address){
        return usersInfo[user_id].userAddr;
    }
    function getUserRole(bytes32 user_id)view public returns (uint8){
        return usersInfo[user_id].role;
    }

    //---------------org info----------------
    
    function setOrgInfo(bytes32 org_id, string org_id_ori, string org_name, address org_contract) public{
        orgsInfo[org_id].orgName = org_name;
        orgsInfo[org_id].orgIDOri = org_id_ori;
        orgsInfo[org_id].contractAddr = org_contract;
    }
    function getOrgInfo(bytes32 org_id)view public returns (string, address, string){
        return (orgsInfo[org_id].orgName,orgsInfo[org_id].contractAddr, orgsInfo[org_id].orgIDOri);
    }
    function getOrgName(bytes32 org_id)view public returns (string){
        return orgsInfo[org_id].orgName;
    }
    function getContractAddress(bytes32 org_id)view public returns ( address){
        return orgsInfo[org_id].contractAddr;
    }

   //---------------query---------------------
/*
    function addStudentBySchoolClass(string org_class, bytes32 user_id)public {
        //string memory key = concat_school_class(org_id,class_id);
        query_studentlist[org_class].push(user_id);
    }
    */
    function getTeacherList(bytes32 org_id) view public returns(bytes32[]){       
        
        return query_school_teacher[org_id];

    }
    function getStudentList(bytes32 org_id,string class_id) view public returns(bytes32[]){
        bytes32 class_byte32 = stringToBytes32(class_id);
        bytes32 org_class = org_id^class_byte32;
        
        return query_studentlist[org_class];

    }
    /*
    function addDistinctClass(bytes32 org_id, string class_id)public{
        if( !isEmptyString(class_id)){
            if(!inArray(org_id,class_id)){
                // Append
                classMapList[org_id][class_id] = true;
                query_classlist[org_id].push(class_id);
            }
        }
    }
*/

    function getDistinctClass(bytes32 org_id) view public returns(bytes32[]){
        string[] memory class_list = query_classlist[org_id];
        bytes32[] memory result = new bytes32[](class_list.length);
        for (uint i = 0; i < class_list.length; i++) {
            result[i] = stringToBytes32(class_list[i]);
        }
        return  result;
    }
    


    
    //------------utility------------------
   
    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        
        assembly {
            result := mload(add(source, 32))
        }        
    }
    
    function isEmptyString(string emptyStringTest) pure internal returns(bool){
        bytes memory tempEmptyStringTest = bytes(emptyStringTest); // Uses memory
        if (tempEmptyStringTest.length == 0) {
            return true;
        // emptyStringTest is an empty string
        } else {
        // emptyStringTest is not an empty string
            return false;
        }
    }
    /*
    function inArray(bytes32 school_id, string class_id) internal view returns (bool) {
        
        // address 0x0 is not valid if pos is 0 is not in the array
        if (!isEmptyString(class_id) && classMapList[school_id][class_id]) {
            return true;
        }        
        return false;
    }*/
    
}
