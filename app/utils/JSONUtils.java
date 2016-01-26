package utils;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * @author matthieu
 */
public class JSONUtils {

	// Needed since Scala prevent us from using overloaded methods of Java classes
	@SuppressWarnings("unchecked")
	public static void addString(JSONObject json, String key, String value) {
		json.put(key, value);
	}

	@SuppressWarnings("unchecked")
	public static void addJSONObject(JSONObject json, String key, JSONObject value) {
		json.put(key, value);
	}

	@SuppressWarnings("unchecked")
	public static void addJSONArray(JSONObject json, String key, JSONArray value) {
		json.put(key, value);
	}

	@SuppressWarnings("unchecked")
	public static String generateMsg(String cmd, JSONObject json) {
		JSONObject msg = new JSONObject();
		msg.put("args", json);

		// Hack to start with {"cmd":"operations", ... }
		return"{\"cmd\":\"" + cmd + "\"," + msg.toString().substring(1);
	}
}
