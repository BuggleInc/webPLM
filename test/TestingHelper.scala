import org.scalatestplus.play._

import org.scalatest.{FunSuite, ParallelTestExecution}
import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.json.Json
import plm.core.lang.{LangJava, LangPython, LangScala, ProgrammingLanguage}
import plm.core.model.lesson.Lessons
import plm.core.model.session.TemplatedSourceFileFactory
import plm.core.utils.FileUtils

import scala.util.matching.Regex
import plm.core.lang.ProgrammingLanguages
import plm.core.model.lesson.tip.DefaultTipFactory
import plm.core.model.lesson.Exercises
import plm.core.model.lesson.ExerciseRunner
import plm.core.model.lesson.ExecutionProgress.outcomeKind
import java.util.Locale


object TestingHelper {
    val programmingLanguages = new ProgrammingLanguages(ClassLoader.getSystemClassLoader());
  val JAVA = programmingLanguages.getProgrammingLanguage("java")
  val SCALA = programmingLanguages.getProgrammingLanguage("scala")
  val PYTHON = programmingLanguages.getProgrammingLanguage("python");
	//private static ProgrammingLanguage blocklyLang = programmingLanguages.getProgrammingLanguage("blockly");

  val TEMPLATE_PATTERN: Regex = raw"(?s).*/\* BEGIN TEMPLATE \*/(.*)/\* END TEMPLATE \*/.*".r
  val SOLUTION_PATTERN: Regex = raw"(?s).*/\* BEGIN SOLUTION \*/(.*)/\* END SOLUTION \*/.*".r
  val PYTHON_TEMPLATE_PATTERN: Regex = raw"(?s).*# BEGIN TEMPLATE(.*)# END TEMPLATE.*".r
  val PYTHON_SOLUTION_PATTERN: Regex = raw"(?s).*# BEGIN SOLUTION(.*)# END SOLUTION.*".r

  def loadSolution(lang: ProgrammingLanguage, exerciseId: String): String = {
    val sourceFileFactory =
      new TemplatedSourceFileFactory(new FileUtils(ClassLoader.getSystemClassLoader), Locale.ENGLISH)
    val sourceFile = sourceFileFactory.newSourceFromFile(exerciseId, lang, exerciseIdToEntityPath(lang, exerciseId))
    extractSolution(lang, sourceFile.getCorrection)
  }

  def exerciseIdToEntityPath(lang: ProgrammingLanguage, exerciseId: String): String = {
    val exercisePathFragments = exerciseId.split(raw"\.")
    val entityDirectory = exercisePathFragments.init.mkString("/")
    val entityName = exercisePathFragments.last
    val langPrefix = if (lang == SCALA) "Scala" else ""
    s"$entityDirectory/$langPrefix${entityName}Entity"
  }

  def extractSolution(lang: ProgrammingLanguage, code: String): String = {
    if (lang == PYTHON) {
      code match {
        case PYTHON_TEMPLATE_PATTERN(solution) => solution
        case PYTHON_SOLUTION_PATTERN(solution) => solution
      }
    } else {
      code match {
        case TEMPLATE_PATTERN(solution) => solution
        case SOLUTION_PATTERN(solution) => solution
      }
    }
  }

  sealed trait ExecutionResult
  case class Success() extends ExecutionResult
  case class Error(message: String) extends ExecutionResult
}