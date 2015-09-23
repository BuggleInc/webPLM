package json.operation

import lessons.sort.baseball.operations._
import play.api.libs.json._
import plm.universe.Operation
import plm.universe.GridWorldCellOperation
import plm.universe.bat.BatOperation
import plm.universe.bugglequest.BuggleOperation
import plm.universe.turtles.operations.TurtleOperation
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.sort.operations.SortOperation
import lessons.sort.dutchflag.operations.DutchFlagOperation
import lessons.sort.pancake.universe.operations.PancakeOperation
import lessons.recursion.hanoi.operations.HanoiOperation

object OperationToJson {
  
  def operationsWrite(operations: Array[Operation]): JsValue = {
    var array = new JsArray()
    operations.foreach { operation =>
      array = array :+ operationWrite(operation)
    }
    return array
  }
  
  def operationWrite (operation: Operation): JsValue = {
    var json: JsValue = null
    operation match {
      case buggleOperation: BuggleOperation =>
        json = BuggleOperationToJson.buggleOperationWrite(buggleOperation)
      case gridWorldCellOperation: GridWorldCellOperation =>
        json = GridWorldCellOperationToJson.gridWorldCellOperationWrite(gridWorldCellOperation)
      case batOperation: BatOperation =>
        json = BatOperationToJson.batOperationWrite(batOperation)
      case sortOperation: SortOperation =>
        json = SortOperationToJson.sortOperationWrite(sortOperation)
      case dutchFlagOperation: DutchFlagOperation =>
        json = DutchFlagOperationToJson.dutchFlagOperationWrite(dutchFlagOperation)
      case pancakeOperation: PancakeOperation =>
        json = PancakeOperationToJson.pancakeOperationWrite(pancakeOperation)
      case baseballOperation: BaseballOperation =>
        json = BaseballOperationToJson.baseballOperationWrite(baseballOperation)
      case hanoiOperation: HanoiOperation =>
        json = HanoiOperationToJson.hanoiOperationWrite(hanoiOperation)
      case turtleOperation: TurtleOperation =>
        json = TurtleOperationToJson.turtleOperationWrite(turtleOperation)
      case _ =>
        Json.obj(
          "operation" -> "arf"    
        )
    }
    json = json.as[JsObject] ++ Json.obj(
      "type" -> operation.getName,
      "msg" -> operation.getMsg
    )
    return json
  }
}