name := """web-PLM"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-library" % "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-compiler" % "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-reflect" % "2.11.4"

libraryDependencies ++= Seq(
  "org.scalatest" %% "scalatest" % "2.2.1" % "test",
  "org.scalatestplus" %% "play" % "1.2.0" % "test",
  jdbc,
  anorm,
  cache,
  ws
)
