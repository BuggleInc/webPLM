package lessons.sort.dutchflag;

import lessons.sort.dutchflag.universe.DutchFlagEntity._
import lessons.sort.dutchflag.universe.DutchFlagEntity
import lessons.sort.dutchflag.universe.DutchFlagWorld;
import plm.core.model.Game

class ScalaDutchFlagAlgoEntity extends DutchFlagEntity {
	
	override def run() {
		solve();
	}

	/* BEGIN TEMPLATE */
	def solve() {
		/* BEGIN SOLUTION */
		var afterBlue=0;
		var beforeWhite=getSize()-1;
		var beforeRed=getSize()-1;
		while (afterBlue <= beforeWhite) {
			
			getColor(afterBlue) match {
			case BLUE =>
				afterBlue += 1
			case WHITE =>
				swap(afterBlue, beforeWhite)
				beforeWhite -= 1
			case RED =>
				swap(afterBlue, beforeWhite)
				swap(beforeRed, beforeWhite)
				beforeWhite -= 1
				beforeRed -= 1
			}
		}
		world.asInstanceOf[DutchFlagWorld].assertSorted();
		/* END SOLUTION */
	}
	/* END TEMPLATE */
}
