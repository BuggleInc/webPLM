package methods.picture;

import java.awt.Color;

import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;
import plm.universe.Direction;
import plm.universe.bugglequest.BuggleWorld;
import plm.universe.bugglequest.SimpleBuggle;

public class PictureMono2 extends ExerciseTemplated {

	public PictureMono2() {
		super("PictureMono2", "PictureMono2");
		//setToolbox();
		BuggleWorld myWorld =  new BuggleWorld(null, "World",21,21);
		myWorld.setDelay(20);
		new SimpleBuggle(myWorld, "Picasso", 0, 20, Direction.EAST, Color.black, Color.lightGray);

		setup(myWorld);
	}
}
