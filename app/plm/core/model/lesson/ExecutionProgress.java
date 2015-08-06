package plm.core.model.lesson;

import java.util.Date;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaFileObject;

import org.xnap.commons.i18n.I18n;

import plm.core.lang.ProgrammingLanguage;

/** Class representing the result of pressing on the "run" button. Either a compilation error, or a percentage of passed/failed tests + a descriptive message */ 
public class ExecutionProgress {

	public static enum outcomeKind { COMPILE, FAIL, PASS };
	public outcomeKind outcome = outcomeKind.PASS;
	
	public String compilationError;
	public String executionError = "";
	public int passedTests, totalTests=0;
	public Date date = new Date();
	public ProgrammingLanguage language;

	/* The feedback from the student in the ExecisePassedDialog */
	public String feedbackDifficulty;
	public String feedbackInterest;
	public String feedback; 

	public ExecutionProgress(ProgrammingLanguage language) {
		this.language = language;
	}
	
	public static ExecutionProgress newCompilationError(String message, ProgrammingLanguage language) {
		ExecutionProgress ep = new ExecutionProgress(language);
		ep.compilationError = message;
		ep.passedTests = -1;
		ep.totalTests = -1;
		if (ep.compilationError == null)
			ep.compilationError = "Unknown compilation error";
		ep.outcome = ExecutionProgress.outcomeKind.COMPILE;

		return ep;
	}
	public static ExecutionProgress newCompilationError(DiagnosticCollector<JavaFileObject> diagnostics, ProgrammingLanguage language) {
		StringBuffer sb = new StringBuffer();
		for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {	
			if (diagnostic.getSource() == null) 
				sb.append("unknown source:"+ diagnostic.getMessage(null)); // -1 because the head is on the first line so the student code begins at line 2
			else
				sb.append(diagnostic.getSource().getName()+":"+(diagnostic.getLineNumber()-1)+":"+ diagnostic.getMessage(null)); // -1 because the head is on the first line so the student code begins at line 2
			sb.append("\n");
		}
		return newCompilationError(sb.toString(), language);
	}
	
	public void setCompilationError(String msg) {
		outcome = ExecutionProgress.outcomeKind.COMPILE;
		compilationError = msg;
		passedTests = -1;
	}
	public void setExecutionError(String msg) {
		outcome = ExecutionProgress.outcomeKind.FAIL;
		executionError = msg;
	}

	public String getMsg(I18n i18n) {
		String res = "";
		if(outcome == ExecutionProgress.outcomeKind.PASS) {
			res = i18n.tr("<html>Congratulations, you passed this exercise.<br>({0} tests passed)", passedTests);
		}
		else if(outcome == ExecutionProgress.outcomeKind.COMPILE) {
			res = compilationError;
		}
		else {
			res = executionError;
		}
		return res;
	}
}
