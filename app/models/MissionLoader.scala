package models


import java.io.File
import java.io.IOException
import java.lang.StringBuffer
import java.util.regex.Matcher
import java.util.regex.Pattern

import org.xnap.commons.i18n.I18n
import java.util.Locale

import scala.collection.mutable.{Map, HashMap}

import plm.core.utils.FileUtils
import play.api.Logger

class MissionLoader {
	protected var tips : Map[String, String] = new HashMap[String, String]();
	
	var mission : String = _;
	var name : String = _;
	 
	def loadHTMLMission(missionName : String, locale : Locale, i18n : I18n) {
		// Ensures we get only the string beginning by "lessons."
		var lessonPos = missionName.indexOf("lessons.", 0);
		var filename : String = missionName.substring(lessonPos).replace('.',File.separatorChar)

		var sb : StringBuffer = null
		try {
			sb = FileUtils.readContentAsText(filename, locale, "html",true);
		} catch {
			case ex : IOException => setMission(i18n.tr("File {0}.html not found.",filename)); return;
		}
		var str : String = sb.toString()

		/* search the mission name */
		var p =  Pattern.compile("<h[123]>([^<]*)<")
		var m = p.matcher(str)
		if (!m.find())
			Logger.warn(i18n.tr("Cannot find the name of mission in {0}.html",filename))
		setName(m.group(1))

		/* prepare the tips, if any */
		var p3 =  Pattern.compile("<div class=\"tip\" id=\"(tip-\\d+?)\" alt=\"([^\"]+?)\">(.*?)</div>",Pattern.MULTILINE|Pattern.DOTALL)
		var m3 = p3.matcher(str)
		while (m3.find()) {	
			tips += ("#"+m3.group(1) -> m3.group(3))
		}
		str = m3.replaceAll("<a href=\"#$1\">$2</a>")

		var p4 =  Pattern.compile("<div class=\"tip\" id=\"(tip-\\d+?)\">(.*?)</div>",Pattern.MULTILINE|Pattern.DOTALL)
		var m4 = p4.matcher(str)
		while (m4.find()) {	
			tips += ("#"+m4.group(1) ->  m4.group(2))
		}		
		str=m4.replaceAll("<a href=\"#$1\">Show Tip</a>")				


		/* get the mission explanation */
		setMission(str)
	}
	
	def setName(name : String) {
		this.name = name;
	}
	
	def setMission(mission : String) {
		this.mission = mission;
	}
}
