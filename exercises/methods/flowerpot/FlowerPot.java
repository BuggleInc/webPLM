package methods.flowerpot;

import java.io.IOException;

import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.BrokenWorldFileException;
import plm.universe.bugglequest.BuggleWorld;

public class FlowerPot extends ExerciseTemplated {

	public FlowerPot() throws IOException, BrokenWorldFileException {
		super("FlowerPot", "FlowerPot");
		//setToolbox();
		BuggleWorld[] myWorlds = new BuggleWorld[] {
				(BuggleWorld) BuggleWorld.newFromFile(null, "exercises/methods/flowerpot/FlowerPot")
		};

		setup(myWorlds);
	}
}
