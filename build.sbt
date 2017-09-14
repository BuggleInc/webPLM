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

  ScalariformKeys.preferences := ScalariformKeys.preferences.value
    .setPreference(FormatXml, false)
    .setPreference(DoubleIndentClassDeclaration, false)
    .setPreference(PreserveDanglingCloseParenthesis, true)
)

lazy val plm = (project in file("deps/PLM")).settings(
  commonSettings,
  unmanagedSourceDirectories in Compile := Seq(baseDirectory.value / "src"),
  unmanagedSourceDirectories in Test := Seq(baseDirectory.value / "test"),
  unmanagedResourceDirectories in Compile := Seq(baseDirectory.value / "src"),

//  mappings in (Compile, packageBin) ++= {
//    (unmanagedResources in Compile).value pair relativeTo(baseDirectory.value / "src")
//  },

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
//      "org.scala-lang" % "scala-library" % "2.11.8",
//      "org.scala-lang" % "scala-compiler" % "2.11.8",
//      "org.scala-lang" % "scala-reflect" % "2.11.8",
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

    unmanagedSourceDirectories in Compile += baseDirectory.value / "exercises",      // Add .java and .scala as sources

    unmanagedResourceDirectories in Compile += baseDirectory.value / "exercises",    // Add .py, .blockly... as resources

    unmanagedSourceDirectories in Assets += baseDirectory.value / "exercises",       // Add .png as assets

    unmanagedResourceDirectories in Compile += baseDirectory.value / "lessons",

    unmanagedResourceDirectories in Assets += baseDirectory.value / "lessons",

    assemblySettings,

    mainClass in assembly := Some("play.core.server.ProdServerStart"),

    fullClasspath in assembly += Attributed.blank(PlayKeys.playPackageAssets.value),

    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
      {
        case PathList("org", "apache", xs @ _*)   => MergeStrategy.first
        case x => old(x)
      }
    }
  )
