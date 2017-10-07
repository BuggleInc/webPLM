import com.typesafe.sbt.SbtScalariform._

import scalariform.formatter.preferences._
import AssemblyKeys._
import sbt.Keys.{libraryDependencies, resolvers}

name := "web-PLM"

version := "2.1.1"

lazy val commonSettings = defaultScalariformSettings ++ Seq(

  resolvers ++= Seq(
    "Atlassian Releases" at "https://maven.atlassian.com/public/",
    Resolver.sonatypeRepo("snapshots")),

  scalaVersion := "2.11.8",

  scalacOptions ++= Seq(
    "-Xmax-classfile-name", "200",
    "-deprecation", // Emit warning and location for usages of deprecated APIs.
    "-feature", // Emit warning and location for usages of features that should be imported explicitly.
    "-unchecked", // Enable additional warnings where generated code depends on assumptions.
    //  "-Xfatal-warnings", // Fail the compilation if there are any warnings.
    "-Xlint", // Enable recommended additional warnings.
    "-Ywarn-adapted-args", // Warn if an argument list is modified to match the receiver.
    "-Ywarn-dead-code", // Warn when dead code is identified.
    "-Ywarn-inaccessible", // Warn about inaccessible types in method signatures.
    "-Ywarn-nullary-override", // Warn when non-nullary overrides nullary, e.g. def foo() over def foo.
    "-Ywarn-numeric-widen" // Warn when numerics are widened.
  ),

  testOptions in Test += Tests.Argument("-oD"), // Display the completion time of each test 

  ScalariformKeys.preferences := ScalariformKeys.preferences.value
    .setPreference(FormatXml, false)
    .setPreference(DoubleIndentClassDeclaration, false)
    .setPreference(PreserveDanglingCloseParenthesis, true)
)

lazy val plm = (project in file("deps/PLM"))
  .settings(
    commonSettings,
    unmanagedSourceDirectories in Compile := Seq(
      baseDirectory.value / "src",
      baseDirectory.value / "resources" / "exercises" // Add .java and .scala as sources
    ),
    unmanagedSourceDirectories in Test := Seq(baseDirectory.value / "test"),
    unmanagedResourceDirectories in Compile := Seq(
      baseDirectory.value / "src",
      baseDirectory.value / "resources" / "exercises", // Add .py, .blockly... as resources
      baseDirectory.value / "resources" / "lessons"
    ),
    libraryDependencies ++= Seq(
      "org.scala-lang" % "scala-reflect" % "2.11.8",
      "org.scala-lang" % "scala-compiler" % "2.11.8"
    )
)

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .dependsOn(plm)
  .settings(
    commonSettings,

    libraryDependencies ++= Seq(
      "org.scala-lang.modules" %% "scala-java8-compat" % "0.8.0",
      "org.mockito" % "mockito-core" % "1.8.5",
      "net.ceedubs" %% "ficus" % "1.1.2",
      "com.mohiva" %% "play-silhouette" % "3.0.4",
      "net.codingwell" %% "scala-guice" % "4.0.0-beta5",
      "codes.reactive" %% "scala-time-threeten" % "0.3.0-SNAPSHOT",
      "org.scalaj" %% "scalaj-http" % "1.1.5",
      cache,
      ws,
      "com.mohiva" %% "play-silhouette-testkit" % "3.0.4" % Test,
      "org.scalatest" %% "scalatest" % "2.2.1" % Test,
      "org.scalatestplus" %% "play" % "1.4.0-M3" % Test,
      "com.github.andyglow" %% "websocket-scala-client" % "0.2.4" % Test
    ),

    // Add .png as assets
    // TODO(polux): either make plm a play sub-project, or write code that loads assets from the plm jar
    unmanagedResourceDirectories in Assets ++= Seq(
      baseDirectory.value / "deps" / "PLM" / "resources" / "lessons",
      baseDirectory.value / "deps" / "PLM" / "resources" / "exercises"),

    assemblySettings,

    mainClass in assembly := Some("play.core.server.ProdServerStart"),

    fullClasspath in assembly += Attributed.blank(PlayKeys.playPackageAssets.value),

    test in assembly := Def.task {},

    mergeStrategy in assembly := {
      case PathList("org", "apache", _*) => MergeStrategy.first
      case PathList("com", "fasterxml", "jackson", _*) => MergeStrategy.first
      case PathList("junit", _*) => MergeStrategy.first
      case PathList("org", "hamcrest", _*) => MergeStrategy.first
      case PathList("org", "mockito", _*) => MergeStrategy.first
      case PathList("org", "objenesis", _*) => MergeStrategy.first
      case PathList("org", "w3c", _*) => MergeStrategy.first // jython-play clash
      case PathList("org", "xml", _*) => MergeStrategy.first // jython-play clash
      case PathList("org", "joda", _*) => MergeStrategy.first // jruby-play clash
      case PathList("com", "kenai", _*) => MergeStrategy.first // jython-jruby clash
      case PathList("javax", "xml", _*) => MergeStrategy.first // jython-jruby clash
      case PathList("jnr", "netdb", _*) => MergeStrategy.first // jython-jruby clash
      case PathList("META-INF", "maven", "com.fasterxml.jackson.core", _*) => MergeStrategy.first
      case PathList("META-INF", "maven", "joda-time", _*) => MergeStrategy.first
      case PathList("META-INF", "maven", "org.apache.httpcomponents", _*) => MergeStrategy.first
      case x => (mergeStrategy in assembly).value(x)
    }
  )
