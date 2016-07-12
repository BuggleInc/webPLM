package recursion.cons.nlast

import plm.universe.bat.BatTest
import plm.universe.cons.RecList
import plm.universe.cons.ConsEntity

class ScalaNlastEntity extends ConsEntity {

  override def run(t: BatTest) {
    val parameter: List[Int] = RecList.fromArraytoScalaList(t.getParameter(0).asInstanceOf[Array[Int]])   
    t.setResult( nlast(parameter, t.getParameter(1).asInstanceOf[Int]) )
  }

  /* BEGIN TEMPLATE */
  def nlast(l:List[Int], n:Int): List[Int] = {
  /* BEGIN SOLUTION */
    butNfirst(l, l.size-n)
  }
  def butNfirst(l:List[Int], n:Int): List[Int] = {
    if (n==0 || l==Nil) {
      l
    } else {
 	    butNfirst(l.tail, n-1)
 	  }
  /* END SOLUTION */
  }
  /* END TEMPLATE */
}
