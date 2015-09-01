import com.typesafe.sbt.SbtScalariform._
import play.PlayScala

import scalariform.formatter.preferences._

//********************************************************
// Play settings
//********************************************************

name := "web-PLM"

version := "1.0"

scalaVersion := "2.11.4"

resolvers := ("Atlassian Releases" at "https://maven.atlassian.com/public/") +: resolvers.value

resolvers += Resolver.sonatypeRepo("snapshots")

libraryDependencies ++= Seq(
  "org.scala-lang" % "scala-library" % "2.11.4",
  "org.scala-lang" % "scala-compiler" % "2.11.4",
  "org.scala-lang" % "scala-reflect" % "2.11.4",
  "org.scalatest" %% "scalatest" % "2.2.1" % "test",
  "org.scalatestplus" %% "play" % "1.2.0" % "test",
  "com.mohiva" %% "play-silhouette" % "2.0",
  "net.codingwell" %% "scala-guice" % "4.0.0-beta5",
  "codes.reactive" %% "scala-time-threeten" % "0.3.0-SNAPSHOT",
  cache,
  ws
)

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalacOptions ++= Seq(
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
)

//********************************************************
// Scalariform settings
//********************************************************

defaultScalariformSettings

ScalariformKeys.preferences := ScalariformKeys.preferences.value
  .setPreference(FormatXml, false)
  .setPreference(DoubleIndentClassDeclaration, false)
  .setPreference(PreserveDanglingCloseParenthesis, true)
