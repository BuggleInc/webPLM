package lessons.sort.baseball;

import lessons.sort.baseball.universe.BaseballWorld;
import plm.core.model.Game;
import plm.core.model.lesson.ExerciseTemplated;
import plm.core.model.lesson.Lesson;

public class NaiveBaseball extends ExerciseTemplated {

	public NaiveBaseball(Game game, Lesson lesson) {
		super(game, lesson);

		setup(new BaseballWorld[] {
				new BaseballWorld(game, "Field 1",4,2, BaseballWorld.MIX_NOBODY_HOME),
				new BaseballWorld(game, "Field 2",4,2, BaseballWorld.MIX_NOBODY_HOME)
		});
	}

}
