import hashlib
s = hashlib.sha3_256()
print(s.name)
data = u"\u0019TcEdu Signed Message:\n4BODY".encode("utf-8")
print(data)
s.update(data)
print(s.hexdigest())
# output bf59ff1dbd6a947a4383ca31ea8849d5101e063e1df5b67f7cfa4e60d9a5589c

s2 = hashlib.sha3_256()
s2.update(u"\u0019NCHC Blockchain Signed Message:\n10HELLO NCHC".encode("utf-8"))
print(s2.hexdigest())

s3 = hashlib.sha3_256()
s3.update(u"\u0019NCHC 國網中心 Signed Message:\n10HELLO NCHC".encode("utf-8"))
print(s3.hexdigest())

s4 = hashlib.sha3_256()
s4.update(u"\u0019NCHC 國網中心 Signed Message:\n16HELLO NCHC國網".encode("utf-8"))
print(s4.hexdigest())