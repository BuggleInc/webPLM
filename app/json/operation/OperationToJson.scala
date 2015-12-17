package json.operation

import plm.universe.baseball.operations._
import play.api.libs.json._
import plm.universe.Operation
import plm.universe.GridWorldCellOperation
import plm.universe.bat.operations.BatOperation
import plm.universe.bugglequest.operations.BuggleOperation
import plm.universe.turtles.operations.TurtleOperation
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.sort.operations.SortOperation
import plm.universe.dutchflag.operations.DutchFlagOperation
import plm.universe.pancake.operations.PancakeOperation
import plm.core.lang.ProgrammingLanguage
import plm.universe.hanoi.operations.HanoiOperation

object OperationToJson {

  def operationsWrite(operations: Array[Operation], progLang: ProgrammingLanguage): JsValue = {
    var array = new JsArray()
    operations.foreach { operation =>
      array = array :+ operationWrite(operation, progLang)
    }
    array
  }

  def operationWrite (operation: Operation, progLang: ProgrammingLanguage): JsValue = {
    var json: JsValue = null
    operation match {
      case buggleOperation: BuggleOperation =>
        json = BuggleOperationToJson.buggleOperationWrite(buggleOperation)
      case gridWorldCellOperation: GridWorldCellOperation =>
        json = GridWorldCellOperationToJson.gridWorldCellOperationWrite(gridWorldCellOperation)
      case batOperation: BatOperation =>
        json = BatOperationToJson.batOperationWrite(batOperation, progLang)
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
      "type" -> operation.getName
    )
    json
  }
}
