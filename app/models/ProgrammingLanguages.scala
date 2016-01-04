package models

import plm.core.lang.LangJava
import plm.core.lang.LangScala
import plm.core.lang.LangPython
import plm.core.lang.ProgrammingLanguage

/**
 * @author matthieu
 */
object ProgrammingLanguages {
  val java: ProgrammingLanguage = new LangJava(false)
  val python: ProgrammingLanguage = new LangPython(false)
  val scala: ProgrammingLanguage = new LangScala(false)

  ProgrammingLanguage.registerSupportedProgLang(java);
  ProgrammingLanguage.registerSupportedProgLang(python);
  ProgrammingLanguage.registerSupportedProgLang(scala);

  def programmingLanguages(): Array[ProgrammingLanguage] = Array(java, python, scala)
  def defaultProgrammingLanguage(): ProgrammingLanguage = ProgrammingLanguage.defaultProgLang
  def getProgrammingLanguage(progLangName: String): ProgrammingLanguage = ProgrammingLanguage.getProgrammingLanguage(progLangName)
}
