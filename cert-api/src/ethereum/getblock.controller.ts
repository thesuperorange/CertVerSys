import { Controller, Get, Post, Request, Response, Param, Next, HttpStatus, Body } from '@nestjs/common';
import { RPCURL } from '../dev/eth.common';
const CertCommon: any = require("cert-common");
const Web3: any = CertCommon.Web3;
let web3 = new Web3();  
web3.setProvider(new web3.providers.HttpProvider(RPCURL));
@Controller('ethereum/block')
export class getController {
    @Get('getlatestblock')
    blocknumber(){
       
      var number = web3.eth.getBlockNumber(function(error, result){
          if(!error){
              console.log(JSON.stringify(result));
          }
          else{
            console.error(error);
          }
      });
       console.log("number =",number);

       return number;
    }
    @Get('/:id')
    
    getblockinfo(@Param() params ,@Response() res:any){
        var numberinfo = web3.eth.getBlock(params.id, function(error, result2){
            if(!error){
                if(result2){
                    res.status(HttpStatus.OK).json({result2});
                }
                else{
                    res.status(HttpStatus.NOT_FOUND).json({});
                }           
            }
                
            else
                console.error(error);
          })
          
    }
}