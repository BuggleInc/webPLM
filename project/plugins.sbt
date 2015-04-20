// Comment to get more information during initialization
logLevel := Level.Warn

// The Typesafe repository
resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

// The Sonatype repository
resolvers += Resolver.sonatypeRepo("snapshots")

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.7")

// Use the Scalariform plugin to reformat the code
addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.3.0")
