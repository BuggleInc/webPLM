import java.util.Locale

import org.scalatestplus.play._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.ExecutionProgress.outcomeKind
import plm.core.model.lesson.{ExerciseRunner, Exercises, Lessons}
import plm.core.model.lesson.tip.DefaultTipFactory
import plm.core.model.session.TemplatedSourceFileFactory
import plm.core.utils.FileUtils

class LocalTest extends PlaySpec {
  import TestingHelper._

	val lessons = new Lessons(ClassLoader.getSystemClassLoader, Nil)
  
	"Local execution" must {
		for {
			lesson <- lessons.lessonsList
			lectureId <- lesson.orderedIDs
			lang <- Seq(JAVA, SCALA, PYTHON)
		} {
			"locally compile exercise "+lectureId+" in "+lang in {
			  
			  localExecuteCode(lesson.id, lectureId, lang, loadSolution(lang, lectureId)) mustBe Success() 
			}
    }
  }

  val exoBook = new Exercises(new Lessons(ClassLoader.getSystemClassLoader(), List("en")),
    new FileUtils(ClassLoader.getSystemClassLoader()),
    programmingLanguages,
    new DefaultTipFactory(), Array(Locale.ENGLISH)
  )
  val exerciseRunner = new ExerciseRunner(Locale.ENGLISH)

  def localExecuteCode(lessonId: String, exerciseId: String, progLang: ProgrammingLanguage, code: String): ExecutionResult = {
    val exo = exoBook.getExercise(exerciseId)
    val result = exerciseRunner.run(exo.get, progLang, code).join()
    result.outcome match {
      case outcomeKind.PASS => Success()
      case _ => Error(result.toString)
    }
  }
}
