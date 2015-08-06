package lessons.backtracking;

import javax.script.ScriptEngine;

import plm.core.lang.ProgrammingLanguage;
import plm.core.model.Game;
import plm.universe.World;

public class BacktrackingWorld extends World {	
	/** A copy constructor (mandatory for the internal compilation mechanism to work)
	 * 
	 * There is normally no need to change it, but it must be present. 
	 */ 
	public BacktrackingWorld(BacktrackingWorld other) {
		super(other);
	}
	public BacktrackingWorld(Game game, BacktrackingPartialSolution sol) {
		super(game, sol.getTitle());
		parameters=new Object[] {sol};
	}
	
	/* The constructor that the exercises will use to setup the world: in subclasses */
	
	/** Reset the state of the current world to the one passed in argument
	 * 
	 * This is mandatory for the PLM good working. Even if the prototype says that the passed object can be 
	 * any kind of world, you can be sure that it's of the same type than the current world. So, there is 
	 * no need to check before casting your argument.
	 * 
	 * Do not forget to call super.reset(w) afterward, or some internal world fields may not get reset.
	 */
	@Override
	public void reset(World w) {
		BacktrackingWorld other = (BacktrackingWorld)w;
		
		if (other.bestSolution == null)
			bestSolution=null;
		else
			bestSolution=other.bestSolution.clone();
		
		
		/* FIXME */
		super.reset(w);		
	}

	@Override
	public String toString(){
		
		return getName()+"Best Solution: ("+bestSolution+")";
	}

	/** Used to check whether the student code changed the world in the right state */
	@Override 
	public boolean equals(Object o) {
		/* same initial world */
		if (o == null || !(o instanceof BacktrackingWorld))
			return false;
		BacktrackingWorld other = (BacktrackingWorld) o;
		if (other.parameters.length != parameters.length)
			return false;
		for (int i=0;i<parameters.length;i++)
			if (!parameters[i].equals(other.parameters[i]))
				return false;
		
		/* Same best solution */
		if (other.bestSolution==null && bestSolution!=null)
			return false;
		if (other.bestSolution!=null && (! other.bestSolution.equals(bestSolution)))
			return false;
		
		/* FIXME */
		return true;
	}
	
	/* Here comes the world logic */
	protected BacktrackingPartialSolution bestSolution = null;
	public void newBestSolution(BacktrackingPartialSolution solution) {
		bestSolution = solution.clone();
		getGame().getLogger().log("XXXX New best solution: "+bestSolution);
	}
	public BacktrackingPartialSolution getBestSolution() {
		return bestSolution;
	}
	@Override
	public void setupBindings(ProgrammingLanguage lang, ScriptEngine e) {
		throw new RuntimeException("No binding of BacktrackingWorld for "+lang);
	}
	@Override
	public String diffTo(World world) {
		return null; // FIXME: implement a textual diff
	}
}
