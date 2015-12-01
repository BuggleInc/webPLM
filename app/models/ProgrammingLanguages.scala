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

  def programmingLanguages(): Array[ProgrammingLanguage] = Array(java, python, scala)
  def defaultProgrammingLanguage(): ProgrammingLanguage = java
  def getProgrammingLanguage(progLangName: String): ProgrammingLanguage = {
    var newProgLang: ProgrammingLanguage = defaultProgrammingLanguage
    programmingLanguages.foreach { progLang =>
      if(progLang.getLang.toLowerCase == progLangName.toLowerCase) {
        newProgLang = progLang
      }
    }
    newProgLang
  }
}
