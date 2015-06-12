package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import json._
import json.world._
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
import models.daos.UserDAOMongoImpl

import java.util.HashMap
import java.nio.file.Files
import java.nio.file.FileSystems
import java.nio.file.FileVisitResult
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.SimpleFileVisitor
import java.nio.file.attribute.BasicFileAttributes
import java.io.File
import java.io.BufferedWriter
import java.io.BufferedReader
import java.io.FileWriter
import java.io.FileReader
import java.io.IOException

object PLMActor {
  def props(actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String])(out: ActorRef) = Props(new PLMActor(actorUUID, gitID, newUser, preferredLang, lastProgLang, out))
  def propsWithUser(actorUUID: String, user: User)(out: ActorRef) = Props(new PLMActor(actorUUID, user, out))
}

class PLMActor(actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], out: ActorRef) extends Actor {  
  var availableLangs: Seq[Lang] = Lang.availables
  var plmLogger: PLMLogger = new PLMLogger(this)
  
  var resultSpy: ExecutionResultListener = null
  var progLangSpy: ProgLangListener  = null
  var humanLangSpy: HumanLangListener = null
  var registeredSpies: List[ExecutionSpy] = null
  
  var currentUser: User = null
  
  var currentPreferredLang: Lang = preferredLang.getOrElse(Lang("en"))
  
  var currentGitID: String = null
  setCurrentGitID(gitID, newUser)
  
  var plm: PLM = new PLM(currentGitID, plmLogger, currentPreferredLang.toLocale, lastProgLang)
  
  initSpies
  registerActor
  
  def this(actorUUID: String, user: User, out: ActorRef) {
    this(actorUUID, user.gitID.toString, false, user.preferredLang, user.lastProgLang, out)
    setCurrentUser(user)
  }
  
  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message")
      Logger.debug(msg.toString())
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "signIn" | "signUp" =>
          setCurrentUser((msg \ "user").asOpt[User].get)
          registeredSpies.foreach { spy => spy.unregister }
          plm.setUserUUID(currentGitID)
          currentUser.preferredLang.getOrElse(None) match {
            case newLang: Lang =>
              currentPreferredLang = newLang
              plm.setLang(currentPreferredLang)
            case _ =>
              savePreferredLang()
          }
          plm.setProgrammingLanguage(currentUser.lastProgLang.getOrElse("Java"))
        case "signOut" =>
          clearCurrentUser()
          registeredSpies.foreach { spy => spy.unregister }
          plm.setUserUUID(currentGitID)
        case "getLessons" =>
          sendMessage("lessons", Json.obj(
            "lessons" -> LessonToJson.lessonsWrite(plm.lessons)
          ))
        case "setProgrammingLanguage" =>
          var optProgrammingLanguage: Option[String] = (msg \ "args" \ "programmingLanguage").asOpt[String]
          (optProgrammingLanguage.getOrElse(None)) match {
            case programmingLanguage: String =>
              plm.setProgrammingLanguage(programmingLanguage)
              saveLastProgLang(programmingLanguage)
            case _ =>
              Logger.debug("getExercise: non-correct JSON")
          }
        case "setLang" =>
          var optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          (optLang.getOrElse(None)) match {
            case lang: String =>
              currentPreferredLang = Lang(lang)
              plm.setLang(currentPreferredLang)
              savePreferredLang()
            case _ =>
              Logger.debug("getExercise: non-correct JSON")
          }
        case "filterMission" =>
            var optMissionText: Option[String] = (msg \ "args" \ "missionText").asOpt[String]
            var optAll: Option[Boolean] = (msg \ "args" \ "all").asOpt[Boolean]
            var optLangs: Option[Array[String]] = (msg \ "args" \ "languages").asOpt[Array[String]]

            (optMissionText.getOrElse(None), optAll.getOrElse(None), optLangs.getOrElse(None)) match {
                case (missionText: String, all: Boolean, langs: Array[String]) => {
                    if(all) {
                        sendMessage("missionFiltered", Json.obj("filteredMission" -> plm.filterMission(missionText, true, false, null)))
                    }
                    else {
                        sendMessage("missionFiltered", Json.obj("filteredMission" -> plm.filterMission(missionText, false, true, langs)))
                    }
                }
                case (_, _, _) => Logger.debug("filterMission: non-correct JSON")
            }
        case "editorRunSolution" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          var buggleWorld = GridWorldToJson.JsonToBuggleWorld(plm.game, (msg \ "args" \ "world"))
        
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String, code: String) =>            
              plm.currentExercise.setupWorlds(Array(buggleWorld))
              var executionSpy: ExecutionSpy = new ExecutionSpy(this, "operations")
              var lect: Lecture = plm.game.getCurrentLesson.getCurrentExercise
              var exo: Exercise = lect.asInstanceOf[Exercise]
              plm.addExecutionSpy(exo, executionSpy, Exercise.WorldKind.CURRENT)
              plm.runExercise(lessonID, exerciseID, code)
            case (_, _, _) =>
             Logger.debug("editorRunSolution: non-correct JSON")
          }
        
        case "editorSaveExercise" =>
          var optName: Option[String] = (msg \ "args" \ "name").asOpt[String]
          var optMission: Option[String] =  (msg \ "args" \ "mission").asOpt[String]
          var optWorlds: Option[Array[JsObject]] = (msg \ "args" \ "worlds").asOpt[Array[JsObject]]
        
          (optName.getOrElse(None), optMission.getOrElse(None), optWorlds.getOrElse(None)) match {
            case (name: String, mission: String, jsWorlds: Array[JsObject]) => {
              
              var worlds: Array[BuggleWorld] = new Array[BuggleWorld](0)
              for(jsWorld <- jsWorlds) {
                worlds = GridWorldToJson.JsonToBuggleWorld(plm.game, jsWorld) +: worlds
              }
              
              /*
                Delete old exercise files
              */
              class DeleteFiles extends SimpleFileVisitor[Path] {

                override def visitFile(file: Path, attrs: BasicFileAttributes): FileVisitResult = {
                  Files.delete(file);
                  return FileVisitResult.CONTINUE;
                }

                override def postVisitDirectory(dir: Path, e: IOException): FileVisitResult = {
                  if (e == null) {
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                  } 
                  else {
                    throw e;
                  }
                }
              }
              
              var exercisePath = Paths.get("./editor/exercises", name)
              
              if(Files.exists(exercisePath)) {
                Files.walkFileTree(exercisePath, new DeleteFiles())
              }
                 
              Files.createDirectory(exercisePath)
              
              /*
                Try writing exercise
              */
              try {
                var buffer: BufferedWriter = null
                
                /* Writing main class... */
                var bufferRead: BufferedReader = new BufferedReader(new FileReader("./editor/classTemplate.java"));
                var newLine: String = null
                var mainClassContent: String = ""
                do {
                  newLine = bufferRead.readLine()
                  mainClassContent = mainClassContent + newLine + "\n"
                } while(newLine != null)
                mainClassContent = mainClassContent.replace("$className", name)
                var loadWorldsContent: String = ""
                for(world <- worlds) {
                  loadWorldsContent = loadWorldsContent + "BuggleWorld.newFromFile(\"" + world.getName + "\")," + "\n"
                }
                mainClassContent = mainClassContent.replace("$loadWorlds", loadWorldsContent)
                buffer = new BufferedWriter(new FileWriter("./editor/exercises/" + name + "/" + name + ".java"))
                buffer.write(mainClassContent)
                buffer.close
                bufferRead.close
                
                /* Writing worlds... */
                for(world <- worlds) {
                  buffer = new BufferedWriter(new FileWriter("./editor/exercises/" + name + "/" 
                                                               + world.getName + ".map"))
                  world.writeToFile(buffer)
                  buffer.close
                }
                
                /* Writing missions... */
                buffer = new BufferedWriter(new FileWriter("./editor/exercises/" + name + "/" + name + ".html"))
                buffer.write(mission)
                buffer.close
                
                /* Writing solutions... */
                var progLangs = plm._currentExercise.getProgLanguages.toArray(Array[ProgrammingLanguage]())
                
                for(pl <- progLangs) {
                  var className = name.capitalize + "Entity"
                  var replace = new HashMap[String, String]()
                  
                  replace.put("class Editor", "class " + className)

                  buffer = new BufferedWriter(new FileWriter("./editor/exercises/" + name + "/" 
                                                             + className + "." + pl.getExt));
                  buffer.write(plm.getCompilableContent(replace, pl));
                  buffer.close
                }
                
              }
              catch {
                case e: IOException =>
                  Logger.debug("Error while writing world file")
              }
            }
            case (_) =>
              Logger.debug("editorSaveExercise: non-correct JSON")
          }
        
        case "getExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var lecture: Lecture = null;
          var executionSpy: ExecutionSpy = new ExecutionSpy(this, "operations")
          var demoExecutionSpy: ExecutionSpy = new ExecutionSpy(this, "demoOperations")
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              lecture = plm.switchExercise(lessonID, exerciseID, executionSpy, demoExecutionSpy)
            case (lessonID:String, _) =>
              lecture = plm.switchLesson(lessonID, executionSpy, demoExecutionSpy)
            case (_, _) =>
              Logger.debug("getExercise: non-correct JSON")
          }
          if(lecture != null) {
            sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getSelectedWorldID)
            ))
          }
        case "getExerciseToEdit" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var lecture: Lecture = null;
          var executionSpy: ExecutionSpy = new ExecutionSpy(this, "operations")
          var demoExecutionSpy: ExecutionSpy = new ExecutionSpy(this, "demoOperations")
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              lecture = plm.switchExercise(lessonID, exerciseID, executionSpy, demoExecutionSpy)
            case (lessonID:String, _) =>
              lecture = plm.switchLesson(lessonID, executionSpy, demoExecutionSpy)
            case (_, _) =>
              Logger.debug("getExerciseToEdit: non-correct JSON")
          }
          if(lecture != null) {
            var progLangs = lecture.asInstanceOf[Exercise].getProgLanguages.toArray(Array[ProgrammingLanguage]())
            var solutionCodes: Array[(String,String)] = new Array[(String,String)](progLangs.length)
            var i = 0
            for(progLang <- progLangs) {
              solutionCodes(i) = (progLang.getLang, plm.getSolutionCode(progLang))
              i = i + 1
            }
            
            sendMessage("exerciseToEdit", Json.obj(
              "exercise" -> LectureToJson.lectureWritesForEditor(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getSelectedWorldID, solutionCodes)
            ))
          }
        
        case "runExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String, code: String) =>
              plm.runExercise(lessonID, exerciseID, code)
            case (_, _, _) =>
              Logger.debug("runExercise: non-correctJSON")
          }
        case "runDemo" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              plm.runDemo(lessonID, exerciseID)
            case (_, _) =>
              Logger.debug("runDemo: non-correctJSON")
          }
        case "stopExecution" =>
          plm.stopExecution
        case "revertExercise" =>
          var lecture = plm.revertExercise
          sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getSelectedWorldID)
          ))
        case "getExercises" =>
          if(plm.currentExercise != null) {
            var lectures = plm.game.getCurrentLesson.getRootLectures.toArray(Array[Lecture]())
            sendMessage("exercises", Json.obj(
              "exercises" -> ExerciseToJson.exercisesWrite(lectures) 
            ))
          }
        case "getLangs" =>
          sendMessage("langs", Json.obj(
            "selected" -> LangToJson.langWrite(currentPreferredLang),
            "availables" -> LangToJson.langsWrite(availableLangs)
          ))
        case _ =>
          Logger.debug("cmd: non-correct JSON")
      }
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
  
  def initSpies() {
    resultSpy = new ExecutionResultListener(this, plm.game)
    plm.game.addGameStateListener(resultSpy)
    
    progLangSpy = new ProgLangListener(this, plm)
    plm.game.addProgLangListener(progLangSpy, true)
    
    humanLangSpy = new HumanLangListener(this, plm)
    plm.game.addHumanLangListener(humanLangSpy, true)
    
    registeredSpies = List()
  }
  
  def registerActor() {
    ActorsMap.add(actorUUID, self)
    sendMessage("actorUUID", Json.obj(
        "actorUUID" -> actorUUID  
      )
    )
  }
  
  def registerSpy(spy: ExecutionSpy) {
    registeredSpies = registeredSpies ::: List(spy)
  }
  
  def saveLastProgLang(programmingLanguage: String) {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          lastProgLang = Some(programmingLanguage)
      )
      UserDAOMongoImpl.save(currentUser)
    }
  }
  
  def savePreferredLang() {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          preferredLang = Some(currentPreferredLang)
      )
      UserDAOMongoImpl.save(currentUser)
    }
  }
  
  override def postStop() = {
    Logger.debug("postStop: websocket closed - removing the spies")
    ActorsMap.remove(actorUUID)
    plm.game.removeGameStateListener(resultSpy)
    plm.game.removeProgLangListener(progLangSpy)
    registeredSpies.foreach { spy => spy.unregister }
  }
}