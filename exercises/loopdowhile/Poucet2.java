package loopdowhile;

import java.io.IOException;

import plm.core.model.lesson.Exercise;
import plm.core.model.lesson.ExerciseTemplated;

import plm.universe.BrokenWorldFileException;
import plm.universe.World;
import plm.universe.bugglequest.BuggleWorld;

public class Poucet2 extends ExerciseTemplated {

	public Poucet2() throws IOException, BrokenWorldFileException {
		super("Poucet2", "Poucet2");
		tabName = "Poucet";
		//setToolbox();

		/* Create initial situation */
		World[] myWorlds = new World[] {
				BuggleWorld.newFromFile(Exercise.directory + "/loopdowhile/Poucet"),
				BuggleWorld.newFromFile(Exercise.directory + "/loopdowhile/Poucet3"),
		};

		setup(myWorlds);
	}
}
