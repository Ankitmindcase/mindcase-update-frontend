import { cn } from "@/lib/utils";
import { Box, Text } from "@radix-ui/themes";
import { useRootStore } from "@/providers/RootProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function MultipleSelectCourt() {
  const { currentCourts } = useRootStore((state) => state);

  return (
    <Box className={cn("transition-all duration-300 flex flex-col gap-2")}>
      <Text className="font-semibold">Jurisdictions</Text>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Input
            name="selectedJurisdictions"
            value={currentCourts.join(", ")}
            placeholder="Select specific jurisdiction"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="p-3 space-y-2">
          {Options.map((op) => (
            <SelectItems key={op} name={op} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Box>
  );
}

const Options = ["Central", "Delhi", "Gujarat"];

const SelectItems = ({ name }: any) => {
  const { currentCourts, setCurrentCourts } = useRootStore((state) => state);
  const isSelected = (name: string) => {
    const exist = currentCourts.findIndex((cc) => cc === name);
    return exist === -1 ? false : true;
  };

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id={name}
        checked={isSelected(name)}
        onCheckedChange={(c) => {
          if (c.valueOf()) {
            setCurrentCourts([...currentCourts, name]);
          } else {
            setCurrentCourts(currentCourts.filter((cc) => cc !== name));
          }
        }}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {name}
        </label>
      </div>
    </div>
  );
};
