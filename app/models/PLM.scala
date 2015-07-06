package models

import spies._
import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Exercise.WorldKind
import plm.core.model.lesson.Exercise.StudentOrCorrection
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.session.SourceFile
import plm.core.model.tracking.ProgressSpyListener
import plm.universe.World
import scala.collection.mutable.ListBuffer
import scala.collection.immutable.HashMap
import play.api.libs.json._
import play.api.Logger
import play.api.i18n.Lang
import log.PLMLogger
import actors.PLMActor
import java.util.Locale

import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;
import com.rabbitmq.client.AMQP.BasicProperties;

class PLM(userUUID: String, plmLogger: PLMLogger, locale: Locale, lastProgLang: Option[String], plmActor: PLMActor, trackUser: Boolean) {
  
  var _currentExercise: Exercise = _
  var _currentLang: Lang = _
  var game = new Game(userUUID, plmLogger, locale, lastProgLang.getOrElse("Java"), trackUser)
  var gitGest = new Git(game, userUUID)
  
  def lessons: Array[Lesson] = game.getLessons.toArray(Array[Lesson]())

  def switchLesson(lessonID: String, executionSpy: ExecutionSpy, demoExecutionSpy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
    addExecutionSpy(exo, demoExecutionSpy, WorldKind.ANSWER)
    _currentExercise = exo;
    
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(0)
    }
    
    return lect
  }
  
  def switchExercise(lessonID: String, exerciseID: String, executionSpy: ExecutionSpy, demoExecutionSpy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    game.switchExercise(exerciseID)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    //addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
    addExecutionSpy(exo, demoExecutionSpy, WorldKind.ANSWER)
    _currentExercise = exo;

    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(0)
    }
    
    return lect
  }
  
  def revertExercise(): Lecture = {
    game.revertExo
    return _currentExercise
  }

  def getSelectedWorldID(): String = {
    return game.getSelectedWorld.getName
  }
  
  def addExecutionSpy(exo: Exercise, spy: ExecutionSpy, kind: WorldKind) {
    // Adding the executionSpy to the current worlds
    exo.getWorlds(kind).toArray(Array[World]()).foreach { world =>
      var worldSpy: ExecutionSpy = spy.clone()
      worldSpy.setWorld(world)
    }
  }
  
  def getInitialWorlds(): Array[World] = {
    if(_currentExercise != null && _currentExercise.getWorlds(WorldKind.INITIAL) != null) _currentExercise.getWorlds(WorldKind.INITIAL).toArray(Array[World]()) else null
  }
  
  
  def runExercise(lessonID: String, exerciseID: String, code: String, workspace: String) {
    Logger.debug("Code:\n"+code)
    _currentExercise.getSourceFile(programmingLanguage, 0).setBody(code)
    if(workspace != null){
      Logger.debug("Workspace:\n"+workspace)
      _currentExercise.getSourceFile(programmingLanguage, 1).setBody(workspace)
    }
    //game.startExerciseExecution()
    askGameLaunch(lessonID, exerciseID, code);
  }
  
  def runDemo(lessonID: String, exerciseID: String) {
    game.startExerciseDemoExecution()
  }
  
  def askGameLaunch(lessonID:String, exerciseID:String, code:String) {
    // Parameters 
    var QUEUE_NAME_REQUEST : String = "worker_in"
    var QUEUE_NAME_REPLY : String = "worker_out"
    var corrId : String = java.util.UUID.randomUUID().toString();
    
    // This part handles compilation with workers.
// Properties
    var props : BasicProperties = new BasicProperties.Builder().correlationId(corrId).replyTo(QUEUE_NAME_REPLY).build()
// Connection
    var factory : ConnectionFactory = new ConnectionFactory()
    factory.setHost("localhost")
    var connection : Connection  = factory.newConnection()
    var channelOut : Channel = connection.createChannel()
    var channelIn : Channel = connection.createChannel()
    channelOut.queueDeclare(QUEUE_NAME_REQUEST, false, false, false, null)
    channelIn.queueDeclare(QUEUE_NAME_REPLY, false, false, false, null)
//Request
    var msg : JsValue = Json.obj(
          "lesson" -> ("lessons." + lessonID),
          "exercise" -> exerciseID,
          "localization" -> game.getLocale.getLanguage,
          "language" -> game.getProgrammingLanguage.getLang,
          "code" -> code
        )
    channelOut.basicPublish("", QUEUE_NAME_REQUEST, props,
        msg.toString.getBytes("UTF-8"))
// Reply
    Logger.debug("waiting for logs as " + corrId)
    var consumer : QueueingConsumer = new QueueingConsumer(channelIn)
    channelIn.basicConsume(QUEUE_NAME_REPLY, false, consumer)
    var state: Boolean = true;
    while(state) {
      var delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
      if(delivery == null) {
        Logger.debug("Execution timeout : sending data about it.")
        plmActor.sendMessage("executionResult", Json.obj(
            "outcome" -> "UNKNOWN",
            "msgType" -> "0",
            "msg" -> "The compiler crashed unexpectedly."))
        state = false;
      }
      else {
        if (delivery.getProperties().getCorrelationId().equals(corrId)) {
          channelIn.basicAck(delivery.getEnvelope().getDeliveryTag(), false)
          var message : String = new String(delivery.getBody(), "UTF-8");
          var replyJSON = Json.parse(message)
          (replyJSON \ "msgType").asOpt[Int].getOrElse(None) match {
            case (msgType:Int) =>
              gitGest.gitEndExecutionPush(replyJSON, code);
              Logger.debug("Executed - Now sending the exercise's result")
              plmActor.sendMessage("executionResult", Json.parse(message))
              state = false;
            case (_) =>
              Logger.debug("The world moved!")
              plmActor.sendMessage("operations", Json.parse(message))
          }
        }
        else
          channelIn.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true)
      }
    }
    channelOut.close();
    channelIn.close();
    connection.close();
  }
  
  
  
  def stopExecution() {
    //game.stopExerciseExecution()
    // NO OP ?
  }
  
  def programmingLanguage: ProgrammingLanguage = game.getProgrammingLanguage
  
  def setProgrammingLanguage(lang: String) {
    game.setProgrammingLanguage(lang)
  }
  
  def getStudentCode: String = {
    if(_currentExercise != null && _currentExercise.getSourceFile(programmingLanguage, programmingLanguage.getVisualIndex()) != null) _currentExercise.getSourceFile(programmingLanguage, programmingLanguage.getVisualIndex()).getBody else ""
  }
  
  def addProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    game.addProgressSpyListener(progressSpyListener)  
  }
  
  def removeProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    game.removeProgressSpyListener(progressSpyListener)  
  }

  def setLang(lang: Lang) {
  	if(_currentLang != lang) {
  		_currentLang = lang
  		game.setLocale(_currentLang.toLocale)
  	}
  }

  def currentExercise: Exercise = _currentExercise
  
  def getMission(progLang: ProgrammingLanguage): String = {
    if(_currentExercise != null) _currentExercise.getMission(progLang) else ""
  }
  
  def setUserUUID(userUUID: String) {
    _currentExercise = null
    game.setUserUUID(userUUID)
  }
  
  def signalIdle(start: String, end: String, duration: String) {
    game.signalIdle(start, end, duration)
  }
  
  def setTrackUser(trackUser: Boolean) {
    game.setTrackUser(trackUser)
  }
}