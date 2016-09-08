package models


import org.eclipse.egit.github.core.Issue
import org.eclipse.egit.github.core.client.GitHubClient
import org.eclipse.egit.github.core.service.IssueService
import play.api.Play
import play.api.Play.current
import play.api.Logger
import java.io.IOException

import play.api.i18n.Lang
import plm.core.lang.ProgrammingLanguage

object GitHubIssueManager {
  private val oAuth2Token: String = Play.configuration.getString("plm.github.oauth").get
  private val repository: String = Play.configuration.getString("plm.github.repo").get
  private val owner: String = Play.configuration.getString("plm.github.owner").get
}

/**
 * @author matthieu
 */
class GitHubIssueManager {

  def generateAdditionalInformations(optLessonName: Option[String], optExerciseID: Option[String],
                                     progLang: ProgrammingLanguage, humanLang: Lang,
                                     plmVersion: String, webplmVersion: String,
                                     optPublicUserID: Option[String],optLastCommitURL: Option[String]): String = {
    var array: Array[String] = Array[String]()

    // If the user is currently in an exercise
    (optLessonName, optExerciseID) match {
      case (Some(lessonName: String), Some(exerciseID: String)) =>
        array = array :+ s"Lesson: $lessonName" :+ s"Exercise: $exerciseID"
      case _ =>

    }

    array = array :+ s"Programming Language: ${progLang.getLang}" :+ s"Lang: ${humanLang.language}" :+ s"PLM version: $plmVersion" :+ s"webPLM version: $webplmVersion"

	// If the user is authenticated
    optPublicUserID match {
      case Some(publicUserID: String) =>
        array = array :+ s"Public user ID: $publicUserID"
        optLastCommitURL match {
          case Some(lastCommitURL: String) =>
            array = array :+ s"Last commit URL: $lastCommitURL"
          case None =>
        }
      case None =>
    }

    array.mkString("\n")
  }

  def postIssue(title: String, body: String, additionalInformations: String): Option[String] = {
    val fullBody: String =
      s"""
        |$body
        |
        |--
        |
        |$additionalInformations
      """.stripMargin

    val client: GitHubClient = new GitHubClient
    client.setOAuth2Token(GitHubIssueManager.oAuth2Token)
    val issue: Issue = new Issue
    issue.setTitle(title)
    issue.setBody(fullBody)
    val issueService: IssueService = new IssueService(client)
    try {
      val i: Issue = issueService.createIssue(GitHubIssueManager.owner, GitHubIssueManager.repository, issue)
      Some(i.getHtmlUrl)
    }
    catch {
      case ex: IOException => {
        Logger.error("Error while uploading issue: ")
        Logger.error(ex.getLocalizedMessage)
        None
      }
    }
  }

  def isCorrect(title: String, body: String): Option[String] = {
    if(title.isEmpty) {
      return Some("The current title is empty, please specify a relevant title.\n")
    }
    None
  }
}
