package methods.flowerpot;

import java.io.IOException;

import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.BrokenWorldFileException;
import plm.universe.bugglequest.BuggleWorld;

public class FlowerCase extends ExerciseTemplated {

	public FlowerCase() throws IOException, BrokenWorldFileException {
		super("FlowerCase", "FlowerCase");
		//setToolbox();
		BuggleWorld[] myWorlds = new BuggleWorld[] {
				(BuggleWorld) BuggleWorld.newFromFile(null, "lessons/welcome/methods/flowerpot/FlowerCase")
		};

		setup(myWorlds);
	}
}
