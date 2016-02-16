package loopdowhile;

import java.io.IOException;


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
				BuggleWorld.newFromFile("exercises/loopdowhile/Poucet"),
				BuggleWorld.newFromFile("exercises/loopdowhile/Poucet3"),
		};
		for (World w: myWorlds)
			w.setDelay(50); // moving a bit faster than usual

		setup(myWorlds);
	}
}
