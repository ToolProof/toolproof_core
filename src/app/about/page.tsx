function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold mb-4">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold mb-4">
      {children}
    </h3>
  );
}

function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-semibold mb-4">
      {children}
    </h4>
  );
}

function H5({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-sm font-semibold mb-4">
      {children}
    </h5>
  );
}

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-4xl text-center mb-8">
        <strong>ToolProof 1.0</strong>
      </h1>
      <p className="mb-4">
        ToolProof is a collection of Resources—essentially files—that define Tools—primarily software—designed to support humanity in achieving a set of Goals.
      </p>
      <H2>
        Etymology
      </H2>
      <p className="mb-4">
        The name ToolProof expresses a stretch goal: to ultimately create tools capable of solving the universe and providing proof of the solution.
      </p>
      <H2>
        Core Concepts
      </H2>
      <H3>
        Resources
      </H3>
      <p className="mb-4">
        In ToolProof, everything is a Resource. Resources are operated on by Tools. There are two main types of Resources—Meta Resources and Object Resources.
      </p>
      <H3>
        Meta Resources
      </H3>
      <p className="mb-4">
        Meta Resources are a special class of Resources in ToolProof, as they are operated on by a dedicated Tool: the ToolProof Engine. There are four primary types of Meta Resources—Tools, Goals, Strategies, and Employments.
      </p>
      <H4>
        Tools
      </H4>
      <p className="mb-4">
        Tools are primarily software, though in future versions of ToolProof they may also include hardware. Tools are the means by which Resources are operated on. Each Tool has input and output specifications, which define the types of Resources it can accept and produce.
      </p>
      <H5>
        ToolProof Engine
      </H5>
      <p className="mb-4">
        The ToolProof Engine is the central Tool in ToolProof—essentially a Meta Tool. It is responsible for executing the system and managing the operation of other Tools. While it mainly operates on Meta Resources to invoke Object Tools (which in turn create Object Resources), it can also operate on itself (i.e., its own source code) to generate improved versions. Remember: in ToolProof, everything is a Resource—including the ToolProof Engine itself.
      </p>
      <H5>
        Object Tools
      </H5>
      <p className="mb-4">
        Object Tools are Tools used to create Object Resources. They can be any form of software or hardware capable of generating these Resources.
      </p>
      <H4>
        Goals
      </H4>
      <p className="mb-4">
        Goals define the objectives that ToolProof aims to achieve.
      </p>
      <p className="mb-4">
        In ToolProof 1.0, the Goals are predefined: to eliminate all diseases on Earth. Each disease listed in the ICD-11 standard (a global framework for classifying diseases) is mapped directly to a corresponding Goal—resulting in a long list of entries like “Eliminate cancer,” “Eliminate diabetes,” and so on. The word Eliminate is used because it encompasses both prevention and cure.
      </p>
      <p className="mb-4">
        That said, specifying Goals is often considered one of the most challenging aspects of designing useful AI systems. A cautionary tale involves a civilization that instructed its powerful AI to eliminate a virulent disease—only for the AI to respond by eliminating the civilization itself, thereby achieving the Goal in an unintended way. ToolProof mitigates such risks by enabling human oversight and control throughout the system: upstream (in defining Goals) and downstream (in executing Strategies). Future versions of ToolProof may support a broader range of Goals, with mechanisms to democratize Goal setting so that users can collectively guide the system.
      </p>
      <p className="mb-4">
        The reason ToolProof 1.0 focuses exclusively on eliminating diseases is that it’s a widely supported, non-controversial Goal. However, that doesn’t mean it’s without complexity. For instance, some viral diseases may be beneficial to contract in childhood to build immunity and prevent more serious conditions later in life.
      </p>
      <p className="mb-4">
        Goal setting is a nuanced topic explored further under <em>Alignment</em>.
      </p>
      <H4>
        Strategies
      </H4>
      <p className="mb-4">
      Strategies are the plans or methods used to achieve the Goals. They define how Tools will be applied to operate on Resources in order to produce the desired outcomes.
      </p>
      <p className="mb-4">
      Each Strategy specifies a set of Tools it employs.
      </p>
      <p className="mb-4">
      Strategies also define the set of Goals they support. For example, in the iterative ligand-generation case discussed in the Example section below, a Strategy may support all diseases whose pathology involves a known protein or DNA target.
      </p>
      <H4>
        Employments
      </H4>
      <p className="mb-4">
      Finally, in our overview of the Meta Resources, we come to Employments. An Employment specifies both a Goal and a Strategy (which must support the chosen Goal) that will be applied to achieve that Goal.
      </p>
      <p className="mb-4">
      In addition, an Employment must specify the actual input Resources required by its Tools. However, it only needs to provide input Resources that are not produced as output by other Tools within the Strategy. For instance, in the iterative ligand-generation example, the Strategy does not need to provide a candidate Resource, because that Resource is generated by a preceding Tool in the sequence—before it is used by another Tool later in the Strategy.

      InputSpecs vs. Inputs
      </p>
      <H3>
        Object Resources
      </H3>
      <H3>
        Example
      </H3>
      <H2>
        Alignment
      </H2>
    </div>
  );
}