###
// Copyright 2010 Cloud Bindings Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
###

###*
 * @fileoverview Utilities for connecting to Amazon Web Services
 *
 * @author aalok@shah.ws (Aalok Shah)
###

goog = window.goog

goog.provide('aws.util')
goog.provide('aws.util.HmacSha1')

goog.require('goog.array')
goog.require('goog.iter')
goog.require('goog.crypt')
goog.require('goog.crypt.base64')
goog.require('goog.crypt.Sha1')
goog.require('goog.object')

aws = window.aws

aws.util.bigEndian32bitArrayToByteArray = (arr) ->
  arr1 = []
  goog.array.forEach(arr,
    (elem, i, arr2) ->
      arr1.push((elem >> 24) & 0x0FF)
      arr1.push((elem >> 16) & 0x0FF)
      arr1.push((elem >> 8) & 0x0FF)
      arr1.push((elem >> 0) & 0x0FF)
  )
  return arr1

aws.util.byteArrayToBigEndian32bitArray = (arr) ->
  arr1 = []
  value = 0
  for i in [0..length-1] by 1
    value <<= 8
    value |= arr[i]
    if (i & 0x03) == 3
      arr1.push(value)
      value = 0
  if arr.length & 0x03 != 0
    value <<= (4 - (arr.length & 0x03)) * 8
    arr1.push(value)
  return arr1


aws.util.stringToBigEndian32bitArray = (str) ->
  byteArr = goog.crypt.stringToUtf8ByteArray(str)
  return aws.util.byteArrayToBigEndian32bitArray(byteArr)

aws.util.getAmzHeadersToSign = (headers, opt_keys_lowercase) ->
  if not headers
    return []
  signableHeaders = new goog.structs.Map(headers)
  amzHeadersObj = new goog.structs.Map()
  amzHeaderNames = []
  goog.iter.forEach(signableHeaders.getKeyIterator(),
    (key, opt_undef, iter) ->
      lkey = key.toLowerCase().trim()
      value = signableHeaders.get(key)
      ###
      // TODO "Unfold" long headers that span multiple lines (as allowed by RFC 2616, section 4.2) by replacing the folding white-space (including new-line) by a single space.
      ###
      if goog.string.startsWith(key, "x-amz-")
        if value instanceof Array
          if amzHeadersObj.containsKey(lkey)
            amzHeadersObj.set(lkey, amzHeadersObj.get(lkey).concat(value))
          else
            amzHeadersObj.set(lkey, value)
            amzHeaderNames.push(key)
        else
          if value == null or value == ""
          else if amzHeadersObj.containsKey(lkey)
            amzHeadersObj.get(lkey).push(String(value))
          else
            amzHeadersObj.set(lkey, String(value))
            amzHeaderNames.push(key)
  )
  amzHeadersArr = []
  amzHeaderNames.sort()
  goog.array.forEach(amzHeaderNames,
    (elem, i, arr) ->
      amzHeadersArr.push([elem, ':', amzHeadersObj.get(elem).join(','), "\n"].join(''))
  )
  return amzHeadersArr


aws.util.HmacSha1.encode = (key, data, opt_sizeOfChar) ->
  blockSize = 16
  sizeOfChar = undefined
  strToByteArray = undefined
  if opt_sizeOfChar == 16
    strToByteArray = goog.crypt.stringToByteArray
    sizeOfChar = 16
  else
    strToByteArray = goog.crypt.stringToByteArray
    sizeOfChar = 8
  keyArr = strToByteArray(key)
  sha1 = new goog.crypt.Sha1()
  maxKeyLength = blockSize * 4
  if keyArr.length > maxKeyLength
    sha1.update(keyArr, keyArr.length)
    keyArr = sha1.digest()
    sha1.reset()
  
  iPadKey = new Array(maxKeyLength)
  oPadKey = new Array(maxKeyLength)
  for i in [0..maxKeyLength-1] by 1
    iPadKey[i] = (keyArr[i] || 0) ^ 0x36
    oPadKey[i] = (keyArr[i] || 0) ^ 0x5C
  
  dataArr = strToByteArray(data)
  
  sha1.update(iPadKey.concat(dataArr), iPadKey.length + dataArr.length)
  hashcodeArr = sha1.digest()
  sha1.reset()
  sha1.update(oPadKey.concat(hashcodeArr), iPadKey.length  + 20)
  hashcodeArr2 = sha1.digest()
  sha1.reset()
  return hashcodeArr2

aws.util.HmacSha1.encodeToString = (key, data) ->
  hashcodeArr = aws.util.HmacSha1.encode(key, data, 8)
  return goog.crypt.base64.encodeByteArray(hashcodeArr)

aws.util.HmacSha1.encodeToUtf8String = (key, data) ->
  hashcodeArr = aws.util.HmacSha1.encode(key, data, 16)
  return goog.crypt.base64.encodeByteArray(hashcodeArr)

