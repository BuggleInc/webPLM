

import java.io.IOException;

import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.BrokenWorldFileException;
import plm.universe.World;
import plm.universe.bugglequest.BuggleWorld;

public class $className extends ExerciseTemplated {

	public $className(Lesson lesson) throws IOException, BrokenWorldFileException {
		super(lesson);
		tabName = "$className";
		
		/* Create initial situation */
		World[] myWorlds = new World[] {
				$loadWorlds
		};
		
		setup(myWorlds);
	}
}
