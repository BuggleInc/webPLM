package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import json._
import models.PLM
import models.User
import log.PLMLogger
import spies._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import plm.universe.Entity
import plm.universe.World
import plm.universe.IWorldView
import plm.universe.GridWorld
import plm.universe.GridWorldCell
import plm.universe.bugglequest.BuggleWorld
import plm.universe.bugglequest.AbstractBuggle
import plm.universe.bugglequest.BuggleWorldCell
import play.api.Play.current
import play.api.i18n.Lang
import play.api.Logger
import java.util.UUID
import java.io.BufferedWriter
import java.io.FileWriter
import models.daos.UserDAORestImpl
import codes.reactive.scalatime._
import Scalatime._

import models.action.Action

object PLMActor {
  def props(actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean])(out: ActorRef) = Props(new PLMActor(actorUUID, gitID, newUser, preferredLang, lastProgLang, trackUser, out))
  def propsWithUser(actorUUID: String, user: User)(out: ActorRef) = Props(new PLMActor(actorUUID, user, out))
}

class PLMActor(actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean], out: ActorRef) extends Actor {  
  var availableLangs: Seq[Lang] = Lang.availables
  var plmLogger: PLMLogger = new PLMLogger(this)
  
  var progLangSpy: ProgLangListener  = null
  var humanLangSpy: HumanLangListener = null
  
  var currentUser: User = null
  
  var currentPreferredLang: Lang = preferredLang.getOrElse(Lang("en"))
  
  var currentGitID: String = null
  setCurrentGitID(gitID, newUser)
  
  var currentTrackUser: Boolean = trackUser.getOrElse(false)
  
  var plm: PLM = new PLM(currentGitID, plmLogger, currentPreferredLang.toLocale, lastProgLang, currentTrackUser)
  
  var userIdle: Boolean = false;
  var idleStart: Instant = null
  var idleEnd: Instant = null
  
  initSpies
  registerActor
  
  def this(actorUUID: String, user: User, out: ActorRef) {
    this(actorUUID, user.gitID.toString, false, user.preferredLang, user.lastProgLang, user.trackUser, out)
    setCurrentUser(user)
  }
  
  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message")
      Logger.debug(msg.toString())
      Action(this, msg).run()
  }
  
  def createMessage(cmdName: String, mapArgs: JsValue): JsValue = {
    return Json.obj(
      "cmd" -> cmdName,
      "args" -> mapArgs
    )
  }
  
  def sendMessage(cmdName: String, mapArgs: JsValue) {
    out ! createMessage(cmdName, mapArgs)
  }
  
  def setCurrentUser(newUser: User) {
    currentUser = newUser
    sendMessage("user", Json.obj(
        "user" -> currentUser
      )
    )
    
    setCurrentGitID(currentUser.gitID.toString, false)
  }
  
  def clearCurrentUser() {
    currentUser = null
    sendMessage("user", Json.obj())
    
    currentGitID = UUID.randomUUID.toString
    setCurrentGitID(currentGitID, true)
  }
  
  def setCurrentGitID(newGitID: String, toSend: Boolean) {
    currentGitID = newGitID;
    if(toSend) {
      sendMessage("gitID", Json.obj(
          "gitID" -> currentGitID  
        )
      )
    }
  }
  
  def writeWorldToFile(exercise : String, worldData : String) {
	  if(exercise != "" && worldData != "") {
		  val bw = new BufferedWriter(new FileWriter("lessonWorlds/" + exercise + ".json"))
		  bw.write(worldData)
		  bw.close();
		  Logger.debug("Written file")
	  }
	  else {
		  Logger.debug("Wrong data")
	  }
  }
  def sendOperation(mID : String, op : JsValue) {
    sendMessage(mID, op)
  }
  
  def endOperation() {
  }
  
  def initSpies() {
    progLangSpy = new ProgLangListener(this, plm)
    plm.game.addProgLangListener(progLangSpy, true)
    
    humanLangSpy = new HumanLangListener(this, plm)
    plm.game.addHumanLangListener(humanLangSpy, true)
  }
  
  def registerActor() {
    ActorsMap.add(actorUUID, self)
    sendMessage("actorUUID", Json.obj(
        "actorUUID" -> actorUUID  
      )
    )
  }
  
  def savePreferredLang() {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          preferredLang = Some(currentPreferredLang)
      )
      UserDAORestImpl.update(currentUser)
    }
  }
  
  def clearUserIdle() {
    userIdle = false
    idleEnd = Instant.apply
    if(idleStart != null) {
      var duration = Duration.between(idleStart, idleEnd)
      Logger.debug("end idling at: "+ idleEnd)
      Logger.debug("duration: " + duration)
      plm.signalIdle(idleStart.toString, idleEnd.toString, duration.toString)
    }
    else {
      Logger.error("receive 'userBack' but not previous 'userIdle'")
    }
    idleStart = null
    idleEnd = null
  }
  
  def saveTrackUser(trackUser: Boolean) {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          trackUser = Some(trackUser)
      )
      UserDAORestImpl.update(currentUser)
    }
  }
  
  override def postStop() = {
    Logger.debug("postStop: websocket closed - removing the spies")
    if(userIdle) {
      clearUserIdle
    }
    ActorsMap.remove(actorUUID)
    plm.game.removeProgLangListener(progLangSpy)
    plm.game.quit
  }
}
