package models


import org.eclipse.egit.github.core.Issue
import org.eclipse.egit.github.core.client.GitHubClient
import org.eclipse.egit.github.core.service.IssueService
import play.api.Play
import play.api.Play.current
import play.api.Logger
import java.io.IOException

object GitHubIssueManager {
  private val oAuth2Token: String = Play.configuration.getString("plm.github.oauth").get
  private val repository: String = Play.configuration.getString("plm.github.repo").get
  private val owner: String = Play.configuration.getString("plm.github.owner").get
}

/**
 * @author matthieu
 */
class GitHubIssueManager {

  def postIssue(title: String, body: String): Option[String] = {
    var client: GitHubClient = new GitHubClient
    client.setOAuth2Token(GitHubIssueManager.oAuth2Token)
    var issue: Issue = new Issue
    issue.setTitle(title)
    issue.setBody(body)
    var issueService: IssueService = new IssueService(client)
    try {
      var i: Issue = issueService.createIssue(GitHubIssueManager.owner, GitHubIssueManager.repository, issue)
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
