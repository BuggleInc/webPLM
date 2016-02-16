package loopdowhile;

import java.io.IOException;

import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.BrokenWorldFileException;
import plm.universe.World;
import plm.universe.bugglequest.BuggleWorld;

public class Poucet1 extends ExerciseTemplated {

	public Poucet1() throws IOException, BrokenWorldFileException {
		super("Poucet1", "Poucet1");
		tabName = "Poucet";
		
		/* Create initial situation */
		World[] myWorlds = new World[] {
				BuggleWorld.newFromFile("exercises/loopdowhile/Poucet"),
				BuggleWorld.newFromFile("exercises/loopdowhile/Poucet2"),
		};
		for (World w: myWorlds) {
			w.setDelay(50); // moving a bit faster than usual
			System.err.println("name: " + w.getName());
		}
		setup(myWorlds);
	}
}