import { initialContractExample, initialRequestExample } from "./schema-example";
import { parameterAllowedValues, parameterTypeLabel } from "./parameter-schema";
import type { Contract, ContractExample, Operation, Param, SecurityRequirement } from "./types";
import { contractLabel } from "./utils";

export function operationToMarkdown(operation: Operation, components?: unknown): string {
  const sections = [
    [
      `# ${operation.summary.title}`,
      `\`${operation.summary.method} ${operation.summary.path}\``,
      operation.description,
    ]
      .filter((section): section is string => Boolean(section))
      .join("\n\n"),
    securitySection(operation.security),
    parametersSection(operation.paramGroups.flatMap((group) => group.params)),
    requestSection(operation.requests, components),
    responsesSection(operation.responses, components),
  ].filter((section): section is string => Boolean(section));

  return sections.join("\n\n");
}

function securitySection(security: SecurityRequirement[]): string | null {
  if (security.length === 0) {
    return null;
  }

  const groups = security.map((requirement) => securityRequirementLabel(requirement));

  return [
    "## Authorization",
    groups.map((group, index) => (index === 0 ? `- ${group}` : `- OR\n- ${group}`)).join("\n"),
  ].join("\n\n");
}

function securityRequirementLabel(requirement: SecurityRequirement): string {
  if (requirement.schemes.length === 0) {
    return "optional authentication";
  }

  return requirement.schemes
    .map((scheme) =>
      scheme.scopes.length > 0 ? `${scheme.name} (${scheme.scopes.join(", ")})` : scheme.name,
    )
    .join(" + ");
}

function parametersSection(parameters: Param[]): string | null {
  if (parameters.length === 0) {
    return null;
  }

  return ["## Parameters", parameterTable(parameters)].join("\n\n");
}

function parameterTable(parameters: Param[]): string {
  return [
    "| Name | In | Type | Required | Description |",
    "| --- | --- | --- | --- | --- |",
    ...parameters.map(
      (parameter) =>
        `| ${tableCell(parameter.name)} | ${tableCell(parameter.location)} | ${tableCell(parameterTypeLabel(parameter.schema))} | ${parameter.required ? "yes" : "no"} | ${tableCell(parameterDescription(parameter))} |`,
    ),
  ].join("\n");
}

function parameterDescription(parameter: Param): string | null {
  const allowedValues = parameterAllowedValues(parameter.schema);
  const availableValues =
    allowedValues.length === 0
      ? null
      : `Available values: ${allowedValues.map((value) => `\`${value}\``).join(", ")}`;
  const parts = [parameter.description, availableValues].filter((part): part is string =>
    Boolean(part),
  );

  return parts.length === 0 ? null : parts.join("\n");
}

function requestSection(requests: Contract[], components: unknown): string | null {
  if (requests.length === 0) {
    return null;
  }

  return [
    "## Request body",
    ...requests.map((contract) => requestContractSection(contract, components)),
  ].join("\n\n");
}

function requestContractSection(contract: Contract, components: unknown): string {
  return [
    contract.mediaType
      ? `**Content-Type:** \`${contract.mediaType}\``
      : "**Content-Type:** unspecified",
    contract.title,
    contractSections(contract, components, 3),
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n\n");
}

function responsesSection(responses: Contract[], components: unknown): string | null {
  if (responses.length === 0) {
    return null;
  }

  return [
    "## Responses",
    ...responses.map((contract) => responseContractSection(contract, components)),
  ].join("\n\n");
}

function responseContractSection(contract: Contract, components: unknown): string {
  return [
    `### ${contractLabel(contract)}`,
    contract.title,
    contract.headers.length > 0
      ? ["#### Headers", parameterTable(contract.headers)].join("\n\n")
      : null,
    contractSections(contract, components, 4),
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n\n");
}

function contractSections(
  contract: Contract,
  components: unknown,
  headingLevel: number,
): string | null {
  const sections: Array<string | null> = [];

  if (contract.schema !== null) {
    sections.push(
      [`${"#".repeat(headingLevel)} Schema`, jsonFence(contract.schema)]
        .filter((section): section is string => Boolean(section))
        .join("\n\n"),
    );
  }

  const examples =
    contract.examples.length > 0
      ? contract.examples
      : contract.schema === null
        ? []
        : [
            {
              name: null,
              summary: null,
              value:
                contract.role === "request"
                  ? initialRequestExample(contract, components)
                  : initialContractExample(contract, components),
            },
          ];

  sections.push(...examples.map((example) => exampleSection(example, headingLevel)));

  const rendered = sections.filter((section): section is string => Boolean(section));

  return rendered.length === 0 ? null : rendered.join("\n\n");
}

function exampleSection(example: ContractExample, headingLevel: number): string {
  const label = example.name ? `Example: ${example.name}` : "Example";

  return [
    `${"#".repeat(headingLevel)} ${label}`,
    example.summary,
    example.description,
    example.externalValue ? `[Open external example](${example.externalValue})` : null,
    jsonFence(example.value),
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n\n");
}

function jsonFence(value: unknown): string | null {
  const json = JSON.stringify(value, null, 2);

  return json === undefined ? null : `\`\`\`json\n${json}\n\`\`\``;
}

function tableCell(value: string | null): string {
  return (value ?? "").replaceAll("|", "\\|").replaceAll(/\r?\n/g, "<br>");
}
