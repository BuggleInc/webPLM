package bat.bool1;

import plm.core.model.lesson.ExerciseTemplated;
import plm.universe.bat.BatExercise;
import plm.universe.bat.BatWorld;

public class SleepIn extends ExerciseTemplated {

	public SleepIn() {
		super("SleepIn", "SleepIn");
		tabName = "SourceCode";

		BatWorld myWorld = new BatWorld(null, "sleepIn");
		myWorld.addTest(BatExercise.VISIBLE,  false,false);
		myWorld.addTest(BatExercise.VISIBLE,  true,false);
		myWorld.addTest(BatExercise.INVISIBLE, false,true);
		myWorld.addTest(BatExercise.INVISIBLE, true,true);

		setup(myWorld);
	}
}
