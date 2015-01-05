package models

class ExecutionResult(msgType: Int, msg: String) {
  var _msgType: Int = msgType
  var _msg: String = msg
  
  def getMsgType: Int = _msgType 
  def getMsg: String = _msg;
}