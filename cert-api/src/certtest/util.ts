
const bignum: any = require('bignum');
let k ="0xe07e453d81f6c0eb7e30faf2d233a3c676723b6fe346a2ab3713aff52a12a5e0";
//var methods ={

function h2d(s) {

	function add(x, y) {
		var c = 0, r = [];
		var x = x.split('').map(Number);
		var y = y.split('').map(Number);
		while(x.length || y.length) {
			var s = (x.pop() || 0) + (y.pop() || 0) + c;
			r.unshift(s < 10 ? s : s - 10); 
			c = s < 10 ? 0 : 1;
		}
		if(c) r.unshift(c);
		return r.join('');
	}

	var dec = '0';
	s.split('').forEach(function(chr) {
		var n = parseInt(chr, 16);
		for(var t = 8; t; t >>= 1) {
			dec = add(dec, dec);
			if(n & t) dec = add(dec, '1');
		}
	});
	return dec;
}




function xorjson(msgRaw, contract) {
	var key = bignum( h2d("0x000000000000000000000000"+contract), base=10 );
	key = key.xor( bignum( h2d(k), base=10 ) );
	
	//為避免長度match時有誤，先轉型為64進位
	var v2= Buffer.from(msgRaw, 'utf8');
	var v3 = v2.toString('hex');
	var adpatch = Buffer.from('-', 'utf8');
	var patch = adpatch.toString('hex');
	
	
	var len = (64 - v3.length%64)/2;
	
	while(len--) {
		v3 += patch;
	}
	
	
	var msg = v3.match(/.{1,64}/g);

	for(var i =  0 ;i < msg.length ; i++) {
		
		let v = "0x"+msg[i];
		v = bignum( h2d(v), base=10 );
		msg[i] = "0x"+v.xor(key).toString(16);
	}
	//console.log(msg);
	return msg;
}

//}

// Issue Functions
function generate_mapping(user) {
    let m = [true];
    var v;
    while (m.length) {
        v = Math.floor((Math.random() * 10000) + 1);
        m = user.cert.filter(function (item) {
            return item[0] === v;
        })
    }
    return v.toString();
}









exports.generate_mapping=generate_mapping;

exports.xorjson=xorjson;

exports.h2d=h2d;
