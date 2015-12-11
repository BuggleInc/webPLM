package bat.bool1;

import plm.universe.bat.BatExercise;
import plm.universe.bat.BatTest;
import plm.universe.bat.BatWorld;

public class SleepIn extends BatExercise {

	public SleepIn() {
		super("SleepIn", "SleepIn");

		BatWorld myWorld = new BatWorld(null, "sleepIn");
		myWorld.addTest(VISIBLE,  false,false);
		myWorld.addTest(VISIBLE,  true,false);
		myWorld.addTest(INVISIBLE, false,true);
		myWorld.addTest(INVISIBLE, true,true);

		setup(myWorld);
		templatePython("SleepIn", new String[] {"Boolean","Boolean"},
				"def sleepIn(weekday, vacation):\n",
				"    return not weekday or vacation\n");
		templateScala("SleepIn", new String[] {"Boolean","Boolean"},
				"def sleepIn(weekday:Boolean, vacation:Boolean): Boolean = {\n",
				"  return !weekday || vacation;\n"
				+ "}\n");
		templateJava("SleepIn", "", new String[] {"Boolean","Boolean"},
				"boolean sleepIn(Boolean weekday, Boolean vacation) {",
				"    return !weekday || vacation;\n"
				+ "}\n");
	}

	public void run(BatTest t) {
		/* BEGIN SKEL */
		t.setResult( sleepIn((Boolean)t.getParameter(0),(Boolean)t.getParameter(1)) );
		/* END SKEL */
	}

	/* BEGIN TEMPLATE */
	boolean sleepIn(boolean weekday, boolean vacation) {
		/* BEGIN SOLUTION */
		return !weekday || vacation;
		/* END SOLUTION */
	}
	/* END TEMPLATE */
}
