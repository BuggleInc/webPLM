package exceptions

class NonImplementedWorldException(msg: String) extends RuntimeException(msg)

object NonImplementedWorldException {
	val msg = "This type of world is not supported yet...";

	def create() : NonImplementedWorldException = new NonImplementedWorldException(msg)
	
	def create(cause: Throwable) = new NonImplementedWorldException(msg).initCause(cause)
}