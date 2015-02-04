name := """web-PLM"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-library" % "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-compiler" % "2.11.4"

libraryDependencies += "org.scala-lang" % "scala-reflect" % "2.11.4"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws
)
