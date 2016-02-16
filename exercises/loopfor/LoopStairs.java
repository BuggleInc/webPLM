package loopfor;

import java.io.IOException;

import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.BrokenWorldFileException;
import plm.universe.World;
import plm.universe.bugglequest.BuggleWorld;

public class LoopStairs extends ExerciseTemplated{
	
		public LoopStairs() throws IOException, BrokenWorldFileException {
			super("LoopStairs", "LoopStairs");
			tabName = "Runner";
			//setToolbox();
					
			/* Create initial situation */
			World[] myWorlds = new World[] {
					BuggleWorld.newFromFile("exercises/loopfor/LoopStairs")
			};
			
			setup(myWorlds);
		}

}
